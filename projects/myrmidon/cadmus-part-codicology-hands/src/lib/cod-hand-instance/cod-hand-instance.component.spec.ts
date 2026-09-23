import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodHandInstance } from '../cod-hands-part';
import { CodHandInstanceComponent } from './cod-hand-instance.component';

describe('CodHandInstanceComponent', () => {
  const SCRIPTS: ThesaurusEntry[] = [
    { id: 'goth', value: 'Gothic' },
    { id: 'hum', value: 'Humanistic' },
    { id: 'car', value: 'Caroline' },
  ];
  const TYPOLOGIES: ThesaurusEntry[] = [
    { id: 'book', value: 'book hand' },
    { id: 'doc', value: 'documentary' },
  ];
  const INSTANCE: CodHandInstance = {
    scripts: ['goth', 'hum'],
    typologies: ['book'],
    ranges: [{ start: { n: 1 }, end: { n: 5 } }],
    rank: 2,
    note: 'a note',
  };

  async function setup(
    instance?: CodHandInstance,
    options?: { dscKeys?: string[]; colors?: ThesaurusEntry[] },
  ) {
    const model = signal<CodHandInstance | undefined>(instance);
    const editorClose = vi.fn();
    const result = await render(CodHandInstanceComponent, {
      bindings: [
        twoWayBinding('instance', model),
        inputBinding('scriptEntries', () => SCRIPTS),
        inputBinding('typeEntries', () => TYPOLOGIES),
        inputBinding('colorEntries', () => options?.colors),
        inputBinding('dscKeys', () => options?.dscKeys),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  // the scripts list is the first table
  const scriptRows = () =>
    within(screen.getAllByRole('table')[0]).queryAllByRole('row');
  const scriptNames = () => scriptRows().map((r) => r.textContent?.trim());
  // the instance editor's own buttons are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the instance values', async () => {
    await setup(INSTANCE);

    expect(scriptNames()).toEqual([
      expect.stringContaining('1. Gothic'),
      expect.stringContaining('2. Humanistic'),
    ]);
    expect(screen.getByRole('spinbutton', { name: /rank/ })).toHaveValue(2);
    expect(screen.getByRole('textbox', { name: /^range/ })).toHaveValue('1-5');
    expect(screen.getByRole('checkbox', { name: /book hand/ })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /documentary/ }),
    ).not.toBeChecked();
    expect(screen.getByPlaceholderText('note')).toHaveValue('a note');
    expect(saveButton()).toBeDisabled();
  });

  it('should require at least one script', async () => {
    const { user } = await setup({ ...INSTANCE, scripts: ['goth'] });
    expect(screen.queryByText('script(s) required')).toBeNull();

    await user.click(
      screen.getByRole('button', { description: /remove this script/i }),
    );

    expect(screen.getByText('script(s) required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should add a script picked from the list', async () => {
    const { user, model } = await setup(INSTANCE);
    const add = screen.getByRole('button', {
      description: /add selected script/i,
    });
    expect(add).toBeDisabled();

    await user.click(screen.getByRole('combobox', { name: /script/ }));
    await user.click(await screen.findByRole('option', { name: 'Caroline' }));
    await user.click(add);

    expect(scriptRows()).toHaveLength(3);

    // adding the same script again has no effect
    await user.click(add);
    expect(scriptRows()).toHaveLength(3);

    await user.click(saveButton());
    expect(model()!.scripts).toEqual(['goth', 'hum', 'car']);
  });

  it('should move scripts up and down', async () => {
    const { user, model } = await setup(INSTANCE);

    const down = screen.getAllByRole('button', {
      description: /move script down/i,
    });
    expect(down[1]).toBeDisabled();
    await user.click(down[0]);
    expect(scriptNames()[0]).toContain('Humanistic');

    await user.click(
      screen.getAllByRole('button', { description: /move script up/i })[1],
    );
    await user.click(saveButton());
    expect(model()!.scripts).toEqual(['goth', 'hum']);
  });

  it('should save the edited instance', async () => {
    const { user, model } = await setup(INSTANCE);

    await user.click(screen.getByRole('checkbox', { name: /documentary/ }));
    const rank = screen.getByRole('spinbutton', { name: /rank/ });
    await user.clear(rank);
    await user.type(rank, '3');
    await user.click(saveButton());

    expect(model()).toEqual({
      scripts: ['goth', 'hum'],
      rank: 3,
      descriptionKey: undefined,
      typologies: ['book', 'doc'],
      colors: undefined,
      ranges: INSTANCE.ranges,
      chronotope: undefined,
      images: undefined,
      note: 'a note',
    });
  });

  it('should require at least one typology', async () => {
    const { user } = await setup(INSTANCE);

    await user.click(screen.getByRole('checkbox', { name: /book hand/ }));

    expect(saveButton()).toBeDisabled();
  });

  it('should pick a description key when keys are available', async () => {
    const { user, model } = await setup(INSTANCE, { dscKeys: ['a', 'b'] });

    await user.click(screen.getByRole('combobox', { name: /dsc\.key/ }));
    await user.click(await screen.findByRole('option', { name: 'b' }));
    await user.click(saveButton());

    expect(model()!.descriptionKey).toBe('b');
  });

  it('should not show description keys when none available', async () => {
    await setup(INSTANCE);
    expect(screen.queryByRole('combobox', { name: /dsc\.key/ })).toBeNull();
  });

  it('should save colors', async () => {
    const { user, model } = await setup(INSTANCE, {
      colors: [{ id: 'red', value: 'red' }],
    });

    await user.click(screen.getByRole('checkbox', { name: /red/ }));
    await user.click(saveButton());

    expect(model()!.colors).toEqual(['red']);
  });

  it('should save images added in the images editor', async () => {
    const { user, model } = await setup(INSTANCE);

    await user.click(screen.getByRole('button', { name: /^image$/ }));
    await user.type(screen.getByRole('textbox', { name: /^ID/ }), 'img1');
    await user.type(screen.getByRole('textbox', { name: /^type/ }), 'photo');
    // images are emitted after a debounce
    await new Promise((r) => setTimeout(r, 350));
    await user.click(saveButton());

    expect(model()!.images).toEqual([
      expect.objectContaining({ id: 'img1', type: 'photo' }),
    ]);
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(INSTANCE);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

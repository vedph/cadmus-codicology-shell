import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { CadmusTextEdService } from '@myrmidon/cadmus-text-ed';
import { NGX_MONACO_LOADER_PROVIDER } from '@jean-merelis/ngx-monaco-editor';

import { CodDecorationElement } from '../cod-decorations-part';
import { CodDecorationElementComponent } from './cod-decoration-element.component';

describe('CodDecorationElementComponent', () => {
  const TYPES: ThesaurusEntry[] = [
    { id: 'initial', value: 'initial' },
    { id: 'frame', value: 'frame' },
  ];
  // type-dependent entries are prefixed by the type ID
  const FLAGS: ThesaurusEntry[] = [
    { id: 'initial.gold', value: 'golden' },
    { id: 'initial.big', value: 'big' },
    { id: 'frame.thin', value: 'thin' },
  ];
  const COLORS: ThesaurusEntry[] = [
    { id: 'initial.red', value: 'red' },
    { id: 'frame.blue', value: 'blue' },
  ];
  // for each type, the space-delimited names of the fields to hide
  const HIDDEN: ThesaurusEntry[] = [{ id: 'frame', value: 'subject refSign' }];
  const ELEMENT: CodDecorationElement = {
    key: 'k1',
    type: 'initial',
    flags: ['initial.gold'],
    ranges: [{ start: { n: 1 }, end: { n: 1 } }],
    instanceCount: 2,
    subject: 'a saint',
    colors: ['initial.red'],
    tag: 't',
  };

  async function setup(
    element?: CodDecorationElement,
    options?: { parentKeys?: string[] },
  ) {
    const model = signal<CodDecorationElement | undefined>(element);
    const editorClose = vi.fn();
    const result = await render(CodDecorationElementComponent, {
      bindings: [
        twoWayBinding('element', model),
        inputBinding('decElemTypeEntries', () => TYPES),
        inputBinding('decElemFlagEntries', () => FLAGS),
        inputBinding('decElemColorEntries', () => COLORS),
        inputBinding('decTypeHiddenEntries', () => HIDDEN),
        inputBinding('parentKeys', () => options?.parentKeys),
        outputBinding('editorClose', editorClose),
      ],
      providers: [
        { provide: CadmusTextEdService, useValue: { edit: vi.fn() } },
        // monaco is not available in jsdom: never load it
        {
          provide: NGX_MONACO_LOADER_PROVIDER,
          useValue: { monacoLoaded: () => new Promise(() => {}) },
        },
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  const saveButton = () =>
    screen.getByRole('button', { description: /accept element changes/i });
  // open the typologies tab, waiting for its content to be rendered
  const openTypologies = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('tab', { name: 'typologies' }));
    await screen.findByRole('textbox', { name: /^text relation/ });
  };

  it('should show the general values', async () => {
    await setup(ELEMENT);

    const type = screen.getByRole('combobox', { name: /type/ });
    await waitFor(() => expect(type).toHaveTextContent('initial'));
    expect(screen.getByRole('spinbutton', { name: /count/ })).toHaveValue(2);
    expect(textbox(/^ranges/)).toHaveValue('1');
    expect(textbox(/^key/)).toHaveValue('k1');
    expect(textbox(/^tag/)).toHaveValue('t');
    expect(saveButton()).toBeDisabled();
  });

  it('should show only the features of the element type', async () => {
    await setup(ELEMENT);

    expect(screen.getByRole('checkbox', { name: /golden/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /big/ })).not.toBeChecked();
    expect(screen.queryByRole('checkbox', { name: /thin/ })).toBeNull();
  });

  it('should show only the colors of the element type', async () => {
    const { user } = await setup(ELEMENT);

    await openTypologies(user);

    expect(screen.getByRole('checkbox', { name: /red/ })).toBeChecked();
    expect(screen.queryByRole('checkbox', { name: /blue/ })).toBeNull();
    expect(textbox(/^subject/)).toHaveValue('a saint');
  });

  it('should hide fields according to the element type', async () => {
    const { user } = await setup({ ...ELEMENT, type: 'frame' });

    await openTypologies(user);

    expect(screen.queryByRole('textbox', { name: /^subject/ })).toBeNull();
    expect(screen.queryByRole('textbox', { name: /^ref\.sign/ })).toBeNull();
    expect(textbox(/^text relation/)).toBeInTheDocument();
  });

  it('should refilter features when the type changes', async () => {
    const { user } = await setup(ELEMENT);

    await user.click(screen.getByRole('combobox', { name: /type/ }));
    await user.click(await screen.findByRole('option', { name: 'frame' }));

    await waitFor(() =>
      expect(screen.getByRole('checkbox', { name: /thin/ })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('checkbox', { name: /golden/ })).toBeNull();
  });

  it('should save the edited element', async () => {
    const { user, model } = await setup(ELEMENT);

    await user.click(screen.getByRole('checkbox', { name: /big/ }));
    await user.clear(textbox(/^key/));
    await user.type(textbox(/^key/), 'k2');
    await user.click(saveButton());

    expect(model()).toEqual(
      expect.objectContaining({
        key: 'k2',
        type: 'initial',
        tag: 't',
        flags: ['initial.gold', 'initial.big'],
        ranges: ELEMENT.ranges,
        instanceCount: 2,
        subject: 'a saint',
        colors: ['initial.red'],
      }),
    );
  });

  it('should save edited typology values', async () => {
    const { user, model } = await setup(ELEMENT);
    await openTypologies(user);

    await user.type(textbox(/^text relation/), ' above ');
    await user.click(screen.getByRole('checkbox', { name: /red/ }));
    await user.click(saveButton());

    expect(model()!.textRelation).toBe('above');
    expect(model()!.colors).toEqual([]);
  });

  it('should reject an invalid key', async () => {
    const { user } = await setup(ELEMENT);

    await user.clear(textbox(/^key/));
    await user.type(textbox(/^key/), 'bad key!');
    await user.tab();

    expect(screen.getByText('invalid key')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should pick a parent key when keys are available', async () => {
    const { user, model } = await setup(ELEMENT, { parentKeys: ['p1', 'p2'] });

    await user.click(screen.getByRole('combobox', { name: /parent key/ }));
    await user.click(await screen.findByRole('option', { name: 'p2' }));
    await user.click(saveButton());

    expect(model()!.parentKey).toBe('p2');
  });

  it('should not show parent keys when none available', async () => {
    await setup(ELEMENT);
    expect(
      screen.queryByRole('combobox', { name: /parent key/ }),
    ).toBeNull();
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(ELEMENT);

    await user.click(
      screen.getByRole('button', { description: /discard element changes/i }),
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

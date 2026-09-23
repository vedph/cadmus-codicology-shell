import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodEdit } from '../cod-edits-part';
import { CodEditEditorComponent } from './cod-edit-editor.component';

describe('CodEditEditorComponent', () => {
  const EDIT: CodEdit = {
    eid: 'e1',
    type: 'gloss',
    tag: 't',
    ranges: [{ start: { n: 1 }, end: { n: 2 } }],
    position: 'margin',
    language: 'lat',
    description: 'desc',
    text: 'text',
    colors: ['red'],
  };
  const COLORS: ThesaurusEntry[] = [
    { id: 'red', value: 'red' },
    { id: 'blue', value: 'blue' },
  ];

  async function setup(
    edit?: CodEdit,
    entries?: {
      types?: ThesaurusEntry[];
      colors?: ThesaurusEntry[];
      techniques?: ThesaurusEntry[];
    },
  ) {
    const model = signal<CodEdit | undefined>(edit);
    const editorClose = vi.fn();
    const result = await render(CodEditEditorComponent, {
      bindings: [
        twoWayBinding('edit', model),
        inputBinding('typeEntries', () => entries?.types),
        inputBinding('colorEntries', () => entries?.colors),
        inputBinding('techEntries', () => entries?.techniques),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  // nested editors have their own buttons: ours are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the edit values', async () => {
    await setup(EDIT);

    expect(textbox(/^EID/)).toHaveValue('e1');
    expect(textbox(/^type/)).toHaveValue('gloss');
    expect(textbox(/^tag/)).toHaveValue('t');
    expect(textbox(/^ranges/)).toHaveValue('1-2');
    expect(textbox(/^position/)).toHaveValue('margin');
    expect(textbox(/^language/)).toHaveValue('lat');
    expect(textbox(/^description/)).toHaveValue('desc');
    expect(textbox(/^text/)).toHaveValue('text');
    expect(saveButton()).toBeDisabled();
  });

  it('should stay pristine once the location editor has initialized', async () => {
    await setup(EDIT);

    // the location editor emits its initial value after a debounce
    await new Promise((r) => setTimeout(r, 400));

    expect(saveButton()).toBeDisabled();
  });

  it('should require the type', async () => {
    const { user } = await setup(EDIT);

    await user.clear(textbox(/^type/));
    await user.tab();

    expect(screen.getByText('type required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should require at least one range', async () => {
    const { user } = await setup({ type: 'gloss', ranges: [] });

    await user.type(textbox(/^text/), 'x');

    expect(saveButton()).toBeDisabled();
  });

  it('should use a select for type when entries are provided', async () => {
    await setup(EDIT, {
      types: [{ id: 'gloss', value: 'Gloss' }],
    });

    const type = screen.getByRole('combobox', { name: /type/ });
    await waitFor(() => expect(type).toHaveTextContent('Gloss'));
  });

  it('should save the edited values', async () => {
    const { user, model } = await setup(EDIT);

    await user.clear(textbox(/^text/));
    await user.type(textbox(/^text/), ' new ');
    await user.clear(textbox(/^position/));
    await user.click(saveButton());

    expect(model()).toEqual({
      eid: 'e1',
      type: 'gloss',
      tag: 't',
      authorIds: undefined,
      techniques: [],
      ranges: EDIT.ranges,
      position: undefined,
      language: 'lat',
      date: undefined,
      colors: ['red'],
      description: 'desc',
      text: 'new',
      references: undefined,
    });
  });

  it('should toggle colors from the flags set', async () => {
    const { user, model } = await setup(EDIT, { colors: COLORS });

    const red = screen.getByRole('checkbox', { name: /red/ });
    const blue = screen.getByRole('checkbox', { name: /blue/ });
    expect(red).toBeChecked();
    expect(blue).not.toBeChecked();

    await user.click(blue);
    await user.click(saveButton());

    expect(model()!.colors).toEqual(['red', 'blue']);
  });

  it('should toggle techniques from the flags set', async () => {
    const { user, model } = await setup(EDIT, {
      techniques: [{ id: 'ink', value: 'ink' }],
    });

    await user.click(screen.getByRole('checkbox', { name: /ink/ }));
    await user.click(saveButton());

    expect(model()!.techniques).toEqual(['ink']);
  });

  it('should show the date editor when date is checked', async () => {
    const { user } = await setup(EDIT);
    const dateCheck = screen.getByRole('checkbox', { name: /^date/ });
    expect(dateCheck).not.toBeChecked();
    const before = screen.getAllByRole('textbox').length;

    await user.click(dateCheck);

    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(before);
  });

  it('should keep the date when set', async () => {
    const { user, model } = await setup({
      ...EDIT,
      date: { a: { value: 1200 } },
    });
    expect(screen.getByRole('checkbox', { name: /^date/ })).toBeChecked();

    await user.type(textbox(/^text/), 'x');
    await user.click(saveButton());

    expect(model()!.date).toEqual({ a: { value: 1200 } });
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(EDIT);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

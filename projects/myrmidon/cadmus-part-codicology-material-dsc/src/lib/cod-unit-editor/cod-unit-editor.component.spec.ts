import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodUnit } from '../cod-material-dsc-part';
import { CodUnitEditorComponent } from './cod-unit-editor.component';

describe('CodUnitEditorComponent', () => {
  const UNIT: CodUnit = {
    eid: 'u1',
    tag: 'main',
    material: 'parch',
    format: 'fol',
    state: 'good',
    ranges: [{ start: { n: 1 }, end: { n: 10 } }],
    noGregory: true,
    note: 'a note',
  };

  async function setup(
    unit?: CodUnit,
    entries?: {
      materials?: ThesaurusEntry[];
      formats?: ThesaurusEntry[];
      states?: ThesaurusEntry[];
    },
  ) {
    const model = signal<CodUnit | undefined>(unit);
    const editorClose = vi.fn();
    const result = await render(CodUnitEditorComponent, {
      bindings: [
        twoWayBinding('unit', model),
        inputBinding('materialEntries', () => entries?.materials),
        inputBinding('formatEntries', () => entries?.formats),
        inputBinding('stateEntries', () => entries?.states),
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

  it('should show the unit values', async () => {
    await setup(UNIT);

    expect(textbox(/^EID/)).toHaveValue('u1');
    expect(textbox(/^tag/)).toHaveValue('main');
    expect(textbox(/^material/)).toHaveValue('parch');
    expect(textbox(/^format/)).toHaveValue('fol');
    expect(textbox(/^state/)).toHaveValue('good');
    expect(textbox(/^range/)).toHaveValue('1-10');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(screen.getByRole('checkbox', { name: /no Gregory/ })).toBeChecked();
    expect(saveButton()).toBeDisabled();
  });

  it.each([
    [/^material/, 'material required'],
    [/^format/, 'format required'],
    [/^state/, 'state required'],
  ])('should require %s', async (name, error) => {
    const { user } = await setup(UNIT);

    await user.clear(textbox(name));
    await user.tab();

    expect(screen.getByText(error)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should use selects when entries are provided', async () => {
    await setup(UNIT, {
      materials: [{ id: 'parch', value: 'parchment' }],
      formats: [{ id: 'fol', value: 'folio' }],
      states: [{ id: 'good', value: 'good state' }],
    });

    const material = screen.getByRole('combobox', { name: /material/ });
    await waitFor(() => expect(material).toHaveTextContent('parchment'));
    expect(screen.getByRole('combobox', { name: /format/ })).toHaveTextContent(
      'folio',
    );
    expect(screen.getByRole('combobox', { name: /state/ })).toHaveTextContent(
      'good state',
    );
  });

  it('should save the edited unit', async () => {
    const { user, model } = await setup(UNIT);

    await user.clear(textbox(/^state/));
    await user.type(textbox(/^state/), ' worn ');
    await user.click(screen.getByRole('checkbox', { name: /no Gregory/ }));
    await user.click(saveButton());

    expect(model()).toEqual({
      ...UNIT,
      state: 'worn',
      noGregory: false,
      chronotopes: undefined,
    });
  });

  it('should save edited ranges', async () => {
    const { user, model } = await setup(UNIT);

    await user.clear(textbox(/^range/));
    await user.type(textbox(/^range/), '2r-3v');
    await new Promise((r) => setTimeout(r, 350));
    await user.click(saveButton());

    expect(model()!.ranges[0].start.n).toBe(2);
    expect(model()!.ranges[0].end.n).toBe(3);
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(UNIT);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

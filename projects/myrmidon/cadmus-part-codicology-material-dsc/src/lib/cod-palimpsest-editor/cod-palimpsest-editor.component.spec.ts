import { outputBinding, signal, twoWayBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { CodPalimpsest } from '../cod-material-dsc-part';
import { CodPalimpsestEditorComponent } from './cod-palimpsest-editor.component';

describe('CodPalimpsestEditorComponent', () => {
  const PALIMPSEST: CodPalimpsest = {
    ranges: [{ start: { n: 3 }, end: { n: 4 } }],
    chronotope: { place: { value: 'Bobbio' } },
    note: 'a note',
  };

  async function setup(palimpsest?: CodPalimpsest) {
    const model = signal<CodPalimpsest | undefined>(palimpsest);
    const editorClose = vi.fn();
    const result = await render(CodPalimpsestEditorComponent, {
      bindings: [
        twoWayBinding('palimpsest', model),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  // the nested chronotope editor has its own buttons: ours are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the palimpsest values', async () => {
    await setup(PALIMPSEST);

    expect(textbox(/^ranges/)).toHaveValue('3-4');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited palimpsest', async () => {
    const { user, model } = await setup(PALIMPSEST);

    await user.clear(textbox(/^note/));
    await user.type(textbox(/^note/), ' new ');
    await user.click(saveButton());

    expect(model()).toEqual({ ...PALIMPSEST, note: 'new' });
  });

  it('should save edited ranges', async () => {
    const { user, model } = await setup(PALIMPSEST);

    await user.clear(textbox(/^ranges/));
    await user.type(textbox(/^ranges/), '5r-6v');
    await new Promise((r) => setTimeout(r, 350));
    await user.click(saveButton());

    expect(model()!.ranges[0].start.n).toBe(5);
    expect(model()!.ranges[0].end.n).toBe(6);
  });

  it('should not save without ranges', async () => {
    const { user } = await setup({ ranges: [] });

    await user.type(textbox(/^note/), 'x');

    expect(saveButton()).toBeDisabled();
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(PALIMPSEST);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

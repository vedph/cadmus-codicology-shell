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

  // signal forms regressions

  it('should ignore child echoes of its data', async () => {
    const { fixture } = await setup(PALIMPSEST);

    fixture.componentInstance.onChronotopeChange({ place: { value: 'Bobbio', tag: undefined } } as any);
    fixture.componentInstance.onLocationChange([{ start: { n: 3 }, end: { n: 4 } }]);
    fixture.detectChanges();

    expect(saveButton()).toBeDisabled();
  });

  it('should get dirty for a real child change', async () => {
    const { fixture } = await setup(PALIMPSEST);

    fixture.componentInstance.onChronotopeChange({ place: { value: 'Rome' } });
    fixture.detectChanges();

    expect(saveButton()).toBeEnabled();
  });

  it('should save on Enter in a text input when dirty', async () => {
    const { user, model } = await setup(PALIMPSEST);

    await user.type(textbox(/^note/), 'x{Enter}');

    expect((model() as any).note).toBe('a notex');
  });

  it('should not save on Enter while pristine', async () => {
    const { user, model } = await setup(PALIMPSEST);

    await user.type(textbox(/^note/), '{Enter}');

    expect(model()).toBe(PALIMPSEST);
  });

  it('should save without the form identity tags', async () => {
    const { user, model } = await setup(PALIMPSEST);

    await user.type(textbox(/^note/), 'x');
    await user.click(saveButton());

    const check = (v: any): void => {
      if (Array.isArray(v)) v.forEach(check);
      else if (v && typeof v === 'object') {
        expect(Object.getOwnPropertySymbols(v)).toHaveLength(0);
        Object.values(v).forEach(check);
      }
    };
    check(model());
  });

  it('should render no form element', async () => {
    const { container } = await setup(PALIMPSEST);
    expect(container.querySelector('form')).toBeNull();
  });
});

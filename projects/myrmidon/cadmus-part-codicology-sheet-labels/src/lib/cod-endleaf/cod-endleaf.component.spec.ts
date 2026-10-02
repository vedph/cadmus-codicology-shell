import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodEndleaf } from '../cod-sheet-labels-part';
import { CodEndleafComponent } from './cod-endleaf.component';

describe('CodEndleafComponent', () => {
  const ENDLEAF: CodEndleaf = {
    location: '(1r',
    material: 'paper',
    note: 'a note',
  };
  const LOCATIONS = ['(1r', '(1v', '(/1r'];

  async function setup(endleaf?: CodEndleaf, matEntries?: ThesaurusEntry[]) {
    const model = signal<CodEndleaf | undefined>(endleaf);
    const editorClose = vi.fn();
    const result = await render(CodEndleafComponent, {
      bindings: [
        twoWayBinding('endleaf', model),
        inputBinding('locations', () => LOCATIONS),
        inputBinding('matEntries', () => matEntries),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const materialInput = () => screen.getByRole('textbox', { name: /^material/ });
  // the nested chronotope editor has its own buttons: ours are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the endleaf values', async () => {
    await setup(ENDLEAF);

    const location = screen.getByRole('combobox', { name: /location/ });
    await waitFor(() => expect(location).toHaveTextContent('(1r'));
    expect(materialInput()).toHaveValue('paper');
    expect(screen.getByRole('textbox', { name: /^note/ })).toHaveValue(
      'a note',
    );
    expect(saveButton()).toBeDisabled();
  });

  it('should offer the available locations', async () => {
    const { user } = await setup(ENDLEAF);

    await user.click(screen.getByRole('combobox', { name: /location/ }));

    const options = await screen.findAllByRole('option');
    expect(options.map((o) => o.textContent?.trim())).toEqual(LOCATIONS);
  });

  it('should use a select for material when entries are provided', async () => {
    await setup(ENDLEAF, [{ id: 'paper', value: 'Paper' }]);

    const material = screen.getByRole('combobox', { name: /material/ });
    await waitFor(() => expect(material).toHaveTextContent('Paper'));
  });

  it('should require the material', async () => {
    const { user } = await setup(ENDLEAF);

    await user.clear(materialInput());
    await user.tab();

    expect(screen.getByText('material required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited endleaf', async () => {
    const { user, model } = await setup(ENDLEAF);

    await user.click(screen.getByRole('combobox', { name: /location/ }));
    await user.click(await screen.findByRole('option', { name: '(/1r' }));
    await user.clear(materialInput());
    await user.type(materialInput(), ' parchment ');
    await user.clear(screen.getByRole('textbox', { name: /^note/ }));
    await user.click(saveButton());

    expect(model()).toEqual({
      location: '(/1r',
      material: 'parchment',
      chronotope: undefined,
      note: undefined,
    });
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(ENDLEAF);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });

  // signal forms regressions

  it('should ignore child echoes of its data', async () => {
    const { fixture } = await setup(ENDLEAF);

    fixture.componentInstance.onChronotopeChange(undefined as any);
    fixture.detectChanges();

    expect(saveButton()).toBeDisabled();
  });

  it('should get dirty for a real child change', async () => {
    const { fixture } = await setup(ENDLEAF);

    fixture.componentInstance.onChronotopeChange({ place: { value: 'Rome' } } as any);
    fixture.detectChanges();

    expect(saveButton()).toBeEnabled();
  });

  it('should save on Enter in a text input when dirty', async () => {
    const { user, model } = await setup(ENDLEAF);

    await user.type(materialInput(), 'x{Enter}');

    expect((model() as any).material).toBe(ENDLEAF.material + 'x');
  });

  it('should not save on Enter while pristine', async () => {
    const { user, model } = await setup(ENDLEAF);

    await user.type(materialInput(), '{Enter}');

    expect(model()).toBe(ENDLEAF);
  });

  it('should save without the form identity tags', async () => {
    const { user, model } = await setup(ENDLEAF);

    await user.type(materialInput(), 'x');
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
    const { container } = await setup(ENDLEAF);
    expect(container.querySelector('form')).toBeNull();
  });
});

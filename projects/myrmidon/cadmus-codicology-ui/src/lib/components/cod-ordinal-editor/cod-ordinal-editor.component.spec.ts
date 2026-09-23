import { outputBinding, signal, twoWayBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import {
  CodOrdinalEditorComponent,
  CodOrdinalValue,
} from './cod-ordinal-editor.component';

describe('CodOrdinalEditorComponent', () => {
  async function setup(ordinal?: CodOrdinalValue) {
    const model = signal<CodOrdinalValue | undefined>(ordinal);
    const cancelEdit = vi.fn();
    const result = await render(CodOrdinalEditorComponent, {
      bindings: [
        twoWayBinding('ordinal', model),
        outputBinding('cancelEdit', cancelEdit),
      ],
    });
    return { ...result, model, cancelEdit, user: userEvent.setup() };
  }

  const getValueInput = () =>
    screen.getByRole('spinbutton', { name: /value/i }) as HTMLInputElement;
  const getSaveButton = () =>
    screen.getByRole('button', { description: /accept changes/i });

  it('should show the ordinal value', async () => {
    await setup({ value: 3 });
    expect(getValueInput()).toHaveValue(3);
  });

  it('should disable save while pristine', async () => {
    await setup({ value: 3 });
    expect(getSaveButton()).toBeDisabled();
  });

  it('should emit the edited ordinal on save, preserving other props', async () => {
    const { user, model } = await setup({ value: 3, min: 1, max: 10 });

    await user.clear(getValueInput());
    await user.type(getValueInput(), '5');
    await user.click(getSaveButton());

    expect(model()).toEqual({ value: 5, min: 1, max: 10 });
  });

  it('should not allow saving a value out of range', async () => {
    const { user, model } = await setup({ value: 3, min: 1, max: 10 });

    await user.clear(getValueInput());
    await user.type(getValueInput(), '11');

    expect(getSaveButton()).toBeDisabled();
    expect(model()).toEqual({ value: 3, min: 1, max: 10 });
  });

  it('should show a warning icon for warned values', async () => {
    const { user } = await setup({ value: 3, warnValues: [7] });
    expect(screen.queryByText('warning')).not.toBeInTheDocument();

    await user.clear(getValueInput());
    await user.type(getValueInput(), '7');

    expect(screen.getByText('warning')).toBeInTheDocument();
  });

  it('should emit cancelEdit when discarding', async () => {
    const { user, cancelEdit } = await setup({ value: 3 });

    await user.click(screen.getByRole('button', { description: /discard changes/i }));

    expect(cancelEdit).toHaveBeenCalled();
  });
});

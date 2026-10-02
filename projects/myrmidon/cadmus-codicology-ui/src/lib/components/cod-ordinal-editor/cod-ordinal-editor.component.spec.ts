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

  // signal forms regressions

  it('should save on Enter in the value input', async () => {
    const { user, model } = await setup({ value: 3 });

    await user.clear(getValueInput());
    await user.type(getValueInput(), '4{Enter}');

    expect(model()).toEqual({ value: 4 });
  });

  it('should not save an out of range value on Enter', async () => {
    const { user, model } = await setup({ value: 3, max: 5 });

    await user.clear(getValueInput());
    await user.type(getValueInput(), '9{Enter}');

    expect(model()).toEqual({ value: 3, max: 5 });
  });

  it('should be pristine again after saving', async () => {
    const { user } = await setup({ value: 3 });

    await user.clear(getValueInput());
    await user.type(getValueInput(), '4');
    expect(getSaveButton()).toBeEnabled();
    await user.click(getSaveButton());

    expect(getSaveButton()).toBeDisabled();
  });

  it('should not save on Enter while pristine', async () => {
    const { user, model } = await setup({ value: 3 });
    const before = model();

    await user.type(getValueInput(), '{Enter}');

    expect(model()).toBe(before);
  });

  it('should render no form element', async () => {
    const { container } = await setup({ value: 3 });
    expect(container.querySelector('form')).toBeNull();
  });
});

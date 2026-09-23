import { inputBinding, signal, twoWayBinding } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TextOrEntrySelectorComponent } from './text-or-entry-selector.component';

describe('TextOrEntrySelectorComponent', () => {
  async function setup(options?: {
    id?: string;
    free?: boolean;
    label?: string;
    entries?: { id: string; value: string }[];
    validators?: ValidatorFn[];
  }) {
    const id = signal<string | undefined>(options?.id);
    const result = await render(TextOrEntrySelectorComponent, {
      bindings: [
        twoWayBinding('id', id),
        inputBinding('free', () => options?.free ?? false),
        inputBinding('label', () => options?.label ?? 'entry'),
        inputBinding('validators', () => options?.validators),
        inputBinding('entries', () => options?.entries),
      ],
    });
    return { ...result, id, user: userEvent.setup() };
  }

  it('should show the ID with the label as placeholder', async () => {
    await setup({ id: 'alpha', label: 'color' });

    expect(screen.getByPlaceholderText('color')).toHaveValue('alpha');
  });

  it('should update the input when the ID changes', async () => {
    const { id, fixture } = await setup({ id: 'alpha' });

    id.set('beta');
    fixture.detectChanges();

    expect(screen.getByPlaceholderText('entry')).toHaveValue('beta');
  });

  it('should emit the typed ID after a debounce', async () => {
    const { user, id } = await setup();

    await user.type(screen.getByPlaceholderText('entry'), 'red');

    await waitFor(() => expect(id()).toBe('red'));
  });

  it('should prefix free text IDs with $', async () => {
    const { user, id } = await setup({ free: true });

    await user.type(screen.getByPlaceholderText('entry'), 'red');

    await waitFor(() => expect(id()).toBe('$red'));
  });

  it('should not prefix again an already prefixed free ID', async () => {
    const { user, id } = await setup({ free: true });

    await user.type(screen.getByPlaceholderText('entry'), '$red');

    await waitFor(() => expect(id()).toBe('$red'));
  });

  it('should pick an entry when entries are provided', async () => {
    const { user, id } = await setup({
      id: 'r',
      entries: [
        { id: 'r', value: 'red' },
        { id: 'b', value: 'blue' },
      ],
    });
    expect(screen.queryByPlaceholderText('entry')).toBeNull();

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'blue' }));

    await waitFor(() => expect(id()).toBe('b'));
  });

  it('should use free text when free even if entries are provided', async () => {
    await setup({ free: true, entries: [{ id: 'r', value: 'red' }] });

    expect(screen.getByPlaceholderText('entry')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('should show validation errors', async () => {
    const { user } = await setup({
      id: 'x',
      validators: [Validators.required],
    });

    await user.clear(screen.getByPlaceholderText('entry'));
    await user.tab();

    expect(screen.getByText('required')).toBeInTheDocument();
  });
});

import { inputBinding, signal, twoWayBinding } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { Flag } from '@myrmidon/cadmus-ui-flag-set';

import { CodLabelCell } from '../label-generator';
import { CodLabelCellComponent } from './cod-label-cell.component';

describe('CodLabelCellComponent', () => {
  const CELL: CodLabelCell = {
    rowId: '1r',
    id: 'n.alpha',
    value: 'i',
    note: 'a note',
  };
  const FLAGS: Flag[] = [
    { id: 'err', label: 'error' },
    { id: 'dub', label: 'dubious' },
  ];

  async function setup(
    cell?: CodLabelCell,
    options?: { flags?: Flag[]; dialogResult?: string[] },
  ) {
    const model = signal<CodLabelCell | undefined>(cell);
    const dialog = {
      open: vi.fn(() => ({ afterClosed: () => of(options?.dialogResult) })),
    };
    const result = await render(CodLabelCellComponent, {
      bindings: [
        twoWayBinding('cell', model),
        inputBinding('featureFlags', () => options?.flags ?? []),
        inputBinding('color', () => '#d5e6e6'),
      ],
      configureTestBed: (tb) =>
        tb.overrideProvider(MatDialog, { useValue: dialog }),
    });
    return { ...result, model, dialog, user: userEvent.setup() };
  }

  const button = (description: RegExp) =>
    screen.getByRole('button', { description });

  it('should render nothing without a cell', async () => {
    await setup();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('should show the cell value', async () => {
    await setup(CELL);

    expect(screen.getByText('i')).toBeInTheDocument();
    expect(button(/edit value/i)).toBeInTheDocument();
    expect(button(/edit note/i)).toBeInTheDocument();
  });

  it('should not offer features editing without feature flags', async () => {
    await setup(CELL);
    expect(
      screen.queryByRole('button', { description: /edit features/i }),
    ).toBeNull();
  });

  it('should edit the value', async () => {
    const { user, model } = await setup(CELL);

    await user.click(button(/edit value/i));
    const input = screen.getByRole('textbox', { name: /value/ });
    expect(input).toHaveValue('i');
    await user.clear(input);
    await user.type(input, ' ii ');
    await user.click(button(/save edit/i));

    expect(model()).toEqual({
      rowId: '1r',
      id: 'n.alpha',
      value: 'ii',
      features: undefined,
      note: 'a note',
    });
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('should save the value on enter', async () => {
    const { user, model } = await setup(CELL);

    await user.click(button(/edit value/i));
    await user.type(screen.getByRole('textbox', { name: /value/ }), 'x{Enter}');

    expect(model()!.value).toBe('ix');
  });

  it('should edit the note', async () => {
    const { user, model } = await setup(CELL);

    await user.click(button(/edit note/i));
    const input = screen.getByRole('textbox', { name: /note/ });
    expect(input).toHaveValue('a note');
    await user.clear(input);
    await user.type(input, 'new note');
    await user.click(button(/save edit/i));

    expect(model()!.note).toBe('new note');
  });

  it('should discard an edit', async () => {
    const { user, model } = await setup(CELL);

    await user.click(button(/edit value/i));
    await user.type(screen.getByRole('textbox', { name: /value/ }), 'zzz');
    await user.click(button(/discard edit/i));

    expect(model()).toBe(CELL);
    expect(screen.getByText('i')).toBeInTheDocument();
  });

  it('should discard an edit on escape', async () => {
    const { user, model } = await setup(CELL);

    await user.click(button(/edit value/i));
    await user.type(
      screen.getByRole('textbox', { name: /value/ }),
      'zzz{Escape}',
    );

    expect(model()).toBe(CELL);
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('should edit features in a dialog', async () => {
    const { user, model, dialog } = await setup(CELL, {
      flags: FLAGS,
      dialogResult: ['dub'],
    });

    await user.click(button(/edit features/i));

    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: { flags: FLAGS, checkedIds: [] },
      }),
    );
    expect(model()!.features).toEqual(['dub']);
    // the features badge shows the checked features
    await waitFor(() =>
      expect(screen.getByText(/dubious/)).toBeInTheDocument(),
    );
  });

  it('should keep features when the dialog is cancelled', async () => {
    const { user, model } = await setup(CELL, { flags: FLAGS });

    await user.click(button(/edit features/i));

    expect(model()).toBe(CELL);
  });
});

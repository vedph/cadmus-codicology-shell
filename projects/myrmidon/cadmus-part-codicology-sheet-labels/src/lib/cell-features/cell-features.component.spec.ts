import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { CellFeaturesComponent } from './cell-features.component';

describe('CellFeaturesComponent', () => {
  async function setup(checkedIds: string[] = ['a']) {
    const dialogRef = { close: vi.fn() };
    const result = await render(CellFeaturesComponent, {
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            flags: [
              { id: 'a', label: 'alpha' },
              { id: 'b', label: 'beta' },
            ],
            checkedIds,
          },
        },
      ],
    });
    return { ...result, dialogRef, user: userEvent.setup() };
  }

  // the dialog action buttons have no text: they are the last two buttons
  const actionButtons = () => screen.getAllByRole('button').slice(-2);

  it('should show the features with their checked state', async () => {
    await setup();

    expect(screen.getByRole('heading', { name: 'Features' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /alpha/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /beta/ })).not.toBeChecked();
  });

  it('should close with the checked features on save', async () => {
    const { user, dialogRef } = await setup();

    await user.click(screen.getByRole('checkbox', { name: /beta/ }));
    await user.click(actionButtons()[1]);

    expect(dialogRef.close).toHaveBeenCalledWith(['a', 'b']);
  });

  it('should close without result on cancel', async () => {
    const { user, dialogRef } = await setup();

    await user.click(screen.getByRole('checkbox', { name: /alpha/ }));
    await user.click(actionButtons()[0]);

    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});

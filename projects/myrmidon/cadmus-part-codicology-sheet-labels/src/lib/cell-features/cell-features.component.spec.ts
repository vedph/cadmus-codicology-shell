import { render } from '@testing-library/angular';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CellFeaturesComponent } from './cell-features.component';

describe('CellFeaturesComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CellFeaturesComponent, {
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: { flags: [], checkedIds: [] } },
      ],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});

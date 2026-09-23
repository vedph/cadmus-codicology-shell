import { Component, input, output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { Citation } from '@myrmidon/cadmus-refs-citation';

import { CitationPickerComponent } from './citation-picker.component';

/**
 * Stub for the citation editor, which requires a fully configured
 * citation schemes set. It shows the received citation and emits
 * a new one on click.
 */
@Component({
  selector: 'cadmus-refs-citation',
  template: `
    <span>citation: {{ citation()?.schemeId }}</span>
    <button type="button" (click)="citationChange.emit(NEW)">pick</button>
  `,
})
class CitationStubComponent {
  public readonly NEW: Citation = { schemeId: 'dc', steps: [] };
  public readonly citation = input<Citation | undefined>();
  public readonly citationChange = output<Citation>();
}

describe('CitationPickerComponent', () => {
  async function setup(payload?: Citation) {
    const dialogRef = { close: vi.fn() };
    const data: { payload?: Citation } = { payload };
    const result = await render(CitationPickerComponent, {
      componentImports: [CitationStubComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    return { ...result, dialogRef, data, user: userEvent.setup() };
  }

  it('should show the citation heading and the initial citation', async () => {
    await setup({ schemeId: 'bible', steps: [] });

    expect(
      screen.getByRole('heading', { name: 'Citation' }),
    ).toBeInTheDocument();
    expect(screen.getByText('citation: bible')).toBeInTheDocument();
  });

  it('should close the dialog with the picked citation', async () => {
    const { user, dialogRef, data } = await setup();

    await user.click(screen.getByRole('button', { name: 'pick' }));

    expect(dialogRef.close).toHaveBeenCalledWith({ schemeId: 'dc', steps: [] });
    expect(data.payload).toEqual({ schemeId: 'dc', steps: [] });
  });

  it('should close without result on cancel', async () => {
    const { fixture, dialogRef } = await setup();

    // cancel is invoked by the hosting dialog's actions
    fixture.componentInstance.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});

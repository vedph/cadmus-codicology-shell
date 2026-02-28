import { ChangeDetectionStrategy, Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Citation, CitationComponent } from '@myrmidon/cadmus-refs-citation';
import { PayloadMatDialogConfig } from '@myrmidon/cadmus-codicology-ui';

/**
 * A citation picker component to be wrapped in a dialog.
 */
@Component({
  selector: 'cadmus-citation-picker',
  imports: [CitationComponent],
  templateUrl: './citation-picker.component.html',
  styleUrls: ['./citation-picker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitationPickerComponent {
  constructor(
    @Optional()
    public dialogRef: MatDialogRef<CitationPickerComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: PayloadMatDialogConfig<Citation | undefined>
  ) {}

  cancel(): void {
    this.dialogRef?.close();
  }

  save(citation: Citation): void {
    // save data and close the dialog
    this.data.payload = citation;
    this.dialogRef?.close(citation);
  }
}

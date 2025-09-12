import { Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

export interface CellFeaturesData {
  flags: Flag[];
  checkedIds: string[];
}

/**
 * Cell features editor dialog.
 */
@Component({
  selector: 'cadmus-cell-features',
  imports: [MatButtonModule, MatIcon, FlagSetComponent],
  templateUrl: './cell-features.component.html',
  styleUrl: './cell-features.component.css',
})
export class CellFeaturesComponent {
  public readonly flags = signal<Flag[]>([]);
  public readonly checkedIds = signal<string[]>([]);

  constructor(
    public dialogRef: MatDialogRef<CellFeaturesData>,
    @Inject(MAT_DIALOG_DATA) public config: CellFeaturesData
  ) {}

  public ngOnInit(): void {
    this.flags.set(this.config?.flags || []);
    this.checkedIds.set(this.config?.checkedIds || []);
  }

  public onCheckedIdsChange(ids: string[]): void {
    this.checkedIds.set(ids);
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public save(): void {
    this.dialogRef.close(this.checkedIds());
  }
}

import { Component, Inject } from '@angular/core';
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
  public flags: Flag[] = [];
  public checkedIds: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<CellFeaturesData>,
    @Inject(MAT_DIALOG_DATA) public config: CellFeaturesData
  ) {}

  public ngOnInit(): void {
    this.flags = this.config?.flags || [];
    this.checkedIds = this.config?.checkedIds || [];
  }

  public onCheckedIdsChange(ids: string[]): void {
    this.checkedIds = ids;
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public save(): void {
    this.dialogRef.close(this.checkedIds);
  }
}

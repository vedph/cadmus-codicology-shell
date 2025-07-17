import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogConfig,
} from '@angular/material/dialog';

/**
 * A dialog configuration that can include a payload.
 * This is useful when you want to pass additional data to the dialog
 * component that is not part of the standard dialog data.
 */
export interface PayloadMatDialogConfig<T> extends MatDialogConfig {
  payload?: T;
}

/**
 * A generic dynamic dialog component.
 * It can be used to display any component passed in the data.component
 * property, e.g.:
 * ```ts
 * @Component( ... )
 * export class SomeComponent {
 * 	constructor(private _dialog: MatDialog) {}
 * 	public openDialog(): void {
 * 		const dialogRef = this._dialog.open(DynamicDialog,  {
 * 			data: { title: 'My Dialog', component: DummyDialog }
 * 		})
 * 	}
 * }
 * ```
 */
@Component({
  selector: 'dynamic-dialog',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './dynamic-dialog.html',
})
export class DynamicDialog {
  constructor(
    public dialogRef: MatDialogRef<DynamicDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}

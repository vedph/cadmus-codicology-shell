import {
  Component,
  effect,
  ElementRef,
  input,
  model,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';

import { Flag, FlagSetBadgeComponent } from '@myrmidon/cadmus-ui-flag-set';

import { CodLabelCell } from '../label-generator';
import { CellFeaturesComponent } from '../cell-features/cell-features.component';

@Component({
  selector: 'cadmus-cod-label-cell',
  templateUrl: './cod-label-cell.component.html',
  styleUrls: ['./cod-label-cell.component.css'],
  imports: [
    MatTooltip,
    MatIcon,
    MatIconButton,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    FlagSetBadgeComponent,
  ],
})
export class CodLabelCellComponent implements OnDestroy {
  private _dropNextUpdate = false
  private _sub?: Subscription;
  /**
   * The cell to display and edit.
   */
  public readonly cell = model<CodLabelCell>();

  /**
   * The color to use for the cell.
   */
  public readonly color = input<string>();

  /**
   * The list of feature flags available for this cell.
   */
  public readonly featureFlags = input<Flag[]>([]);

  /**
   * The list of feature flags set for the current cell.
   */
  public readonly cellFlags = signal<Flag[]>([]);

  @ViewChild('valueInput')
  public valueElement?: ElementRef;
  @ViewChild('noteInput')
  public noteElement?: ElementRef;

  public editMode: 'none' | 'value' | 'note';
  public value: FormControl<string | null>;
  public note: FormControl<string | null>;
  public features: FormControl<string[]>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder, public dialog: MatDialog) {
    this.editMode = 'none';
    // form
    this.value = formBuilder.control(null, Validators.maxLength(50));
    this.note = formBuilder.control(null, Validators.maxLength(500));
    this.features = formBuilder.control([], { nonNullable: true });
    this.form = formBuilder.group({
      value: this.value,
      note: this.note,
      features: this.features,
    });

    effect(() => {
      if (this._dropNextUpdate) {
        this._dropNextUpdate = false;
        return;
      }
      this.updateForm(this.cell());
    });

    // when the features change, update their mapped flags
    this._sub = this.features.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe(() => {
        this.cellFlags.set(this.features.value.map(
          (f) => this.featureFlags().find((ff) => ff.id === f)!
        ));
      });
  }

  public ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  public editValue(): void {
    if (this.editMode !== 'none') {
      return;
    }
    this.editMode = 'value';
    this.features.setValue(this.cell()?.features || []);
    setTimeout(() => {
      this.valueElement?.nativeElement.focus();
      this.valueElement?.nativeElement.select();
    }, 500);
  }

  public editNote(): void {
    if (this.editMode !== 'none') {
      return;
    }
    this.editMode = 'note';
    setTimeout(() => {
      this.noteElement?.nativeElement.focus();
      this.noteElement?.nativeElement.select();
    }, 500);
  }

  private updateForm(cell: CodLabelCell | undefined): void {
    if (!cell) {
      this.form.reset();
      return;
    }
    this.value.setValue(cell.value || null);
    this.note.setValue(cell.note || null);
    this.features.setValue(cell.features || []);
    this.form.markAsPristine();
  }

  private getCell(): CodLabelCell {
    return {
      rowId: this.cell()!.rowId,
      id: this.cell()!.id,
      value: this.value.value?.trim(),
      features: this.features.value?.length ? this.features.value : undefined,
      note: this.note.value?.trim(),
    };
  }

  public editFeatures(): void {
    if (!this.featureFlags().length) {
      return;
    }

    const dialogRef = this.dialog.open(CellFeaturesComponent, {
      height: '300px',
      width: '400px',
      data: {
        flags: this.featureFlags(),
        checkedIds: this.features.value,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.features.setValue(result);
        this.features.markAsDirty();
        this.features.updateValueAndValidity();
        // save changes to cell
        this._dropNextUpdate = true;
        this.cell.set(this.getCell());
      }
    });
  }

  public saveEdit(): void {
    if (this.form.invalid) {
      return;
    }
    this.editMode = 'none';
    this.cell.set(this.getCell());
  }

  public cancelEdit(): void {
    this.updateForm(this.cell());
    this.editMode = 'none';
  }
}

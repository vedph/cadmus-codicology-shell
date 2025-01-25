import {
  Component,
  effect,
  ElementRef,
  input,
  model,
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

import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { CodLabelCell } from '../label-generator';

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
  ],
})
export class CodLabelCellComponent {
  public readonly cell = model<CodLabelCell>();

  public readonly color = input<string>();

  @ViewChild('valueInput')
  public valueElement?: ElementRef;
  @ViewChild('noteInput')
  public noteElement?: ElementRef;

  public editMode: 'none' | 'value' | 'note';
  public value: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.editMode = 'none';
    // form
    this.value = formBuilder.control(null, Validators.maxLength(50));
    this.note = formBuilder.control(null, Validators.maxLength(500));
    this.form = formBuilder.group({
      value: this.value,
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.cell());
    });
  }

  public editValue(): void {
    if (this.editMode !== 'none') {
      return;
    }
    this.editMode = 'value';
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
  }

  private getCell(): CodLabelCell {
    return {
      rowId: this.cell()!.rowId,
      id: this.cell()!.id,
      value: this.value.value?.trim(),
      note: this.note.value?.trim(),
    };
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

import { Component, effect, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CodOrdinalValue {
  value: number;
  min?: number;
  max?: number;
  warnValues?: number[];
}

@Component({
  selector: 'cadmus-cod-ordinal-editor',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './cod-ordinal-editor.component.html',
  styleUrls: ['./cod-ordinal-editor.component.css'],
})
export class CodOrdinalEditorComponent {
  public readonly ordinal = model<CodOrdinalValue>();
  public readonly cancelEdit = output();

  public value: FormControl<number>;
  public form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    // form
    this.value = formBuilder.control<number>(0, {
      nonNullable: true,
    });
    this.form = formBuilder.group({
      value: this.value,
    });

    // when model changes, update form
    effect(() => {
      const data = this.ordinal();
      this.updateForm(data);
    });
  }

  private updateForm(data: CodOrdinalValue | undefined | null): void {
    if (!data) {
      this.form.reset();
    } else {
      // if specified in data set min and max for ordinal control
      const validators: ValidatorFn[] = [];
      if (data.min !== undefined) {
        validators.push(Validators.min(data.min));
      }
      if (data.max !== undefined) {
        validators.push(Validators.max(data.max));
      }
      this.value.setValidators(validators);
      this.value.setValue(data.value, {
        emitEvent: false,
      });
      this.value.updateValueAndValidity();
    }

    this.form.updateValueAndValidity();
    this.form.markAsPristine();
  }

  private getData(): CodOrdinalValue {
    return {
      ...this.ordinal(),
      value: this.value.value,
    };
  }

  public cancel(): void {
    this.cancelEdit.emit();
  }

  /**
   * Saves the current form data by updating the `data` model signal.
   * This method can be called manually (e.g., by a Save button) or
   * automatically (via auto-save).
   * @param pristine If true (default), the form is marked as pristine
   * after saving.
   * Set to false for auto-save if you want the form to remain dirty.
   */
  public save(pristine = true): void {
    if (this.form.invalid) {
      // show validation errors
      this.form.markAllAsTouched();
      return;
    }

    const data = this.getData();
    this.ordinal.set(data);

    if (pristine) {
      this.form.markAsPristine();
    }
  }
}

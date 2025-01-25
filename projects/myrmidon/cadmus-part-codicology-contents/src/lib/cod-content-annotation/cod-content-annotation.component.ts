import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodContentAnnotation } from '../cod-contents-part';

@Component({
  selector: 'cadmus-cod-content-annotation',
  templateUrl: './cod-content-annotation.component.html',
  styleUrls: ['./cod-content-annotation.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    CodLocationComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodContentAnnotationComponent {
  public readonly annotation = model<CodContentAnnotation>();

  // cod-content-annotation-types
  public readonly typeEntries = input<ThesaurusEntry[]>();

  public editorClose = output();

  public type: FormControl<string | null>;
  public ranges: FormControl<CodLocationRange[]>;
  public incipit: FormControl<string | null>;
  public explicit: FormControl<string | null>;
  public text: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.ranges = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.incipit = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(500),
    ]);
    this.explicit = formBuilder.control(null, Validators.maxLength(500));
    this.text = formBuilder.control(null, Validators.maxLength(1000));
    this.note = formBuilder.control(null, Validators.maxLength(5000));
    this.form = formBuilder.group({
      type: this.type,
      ranges: this.ranges,
      incipit: this.incipit,
      explicit: this.explicit,
      note: this.note,
      text: this.text,
    });

    effect(() => {
      this.updateForm(this.annotation());
    });
  }

  private updateForm(model: CodContentAnnotation | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.type.setValue(model.type);
    this.ranges.setValue([model.range]);
    this.incipit.setValue(model.incipit);
    this.explicit.setValue(model.explicit || null);
    this.text.setValue(model.text || null);
    this.note.setValue(model.note || null);
    this.form.markAsPristine();
  }

  private getModel(): CodContentAnnotation {
    return {
      type: this.type.value?.trim() || '',
      range: this.ranges.value.length ? this.ranges.value[0] : (null as any),
      incipit: this.incipit.value?.trim() || '',
      explicit: this.explicit.value?.trim() || '',
      text: this.text.value?.trim() || '',
      note: this.note.value?.trim() || undefined,
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.annotation.set(this.getModel());
  }
}

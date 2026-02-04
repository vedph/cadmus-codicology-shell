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
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import {
  AssertedChronotope,
  AssertedChronotopeComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodPalimpsest } from '../cod-material-dsc-part';

@Component({
  selector: 'cadmus-cod-palimpsest-editor',
  templateUrl: './cod-palimpsest-editor.component.html',
  styleUrls: ['./cod-palimpsest-editor.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CodLocationComponent,
    AssertedChronotopeComponent,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodPalimpsestEditorComponent {
  public readonly palimpsest = model<CodPalimpsest>();

  // chronotope-tags
  public readonly ctTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public readonly editorClose = output();

  public ranges: FormControl<CodLocationRange[]>;
  public chronotope: FormControl<AssertedChronotope | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.ranges = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.chronotope = formBuilder.control(null);
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      ranges: this.ranges,
      chronotope: this.chronotope,
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.palimpsest());
    });
  }

  private updateForm(palimpsest: CodPalimpsest | undefined): void {
    if (!palimpsest) {
      this.form.reset();
      return;
    }

    this.ranges.setValue(palimpsest.ranges);
    this.chronotope.setValue(palimpsest.chronotope || null);
    this.note.setValue(palimpsest.note || null);
    this.form.markAsPristine();
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onChronotopeChange(chronotope: AssertedChronotope | null): void {
    this.chronotope.setValue(chronotope);
    this.chronotope.updateValueAndValidity();
    this.chronotope.markAsDirty();
  }

  private getModel(): CodPalimpsest {
    return {
      ranges: this.ranges.value,
      chronotope: this.chronotope.value!,
      note: this.note.value?.trim(),
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.palimpsest.set(this.getModel());
  }
}

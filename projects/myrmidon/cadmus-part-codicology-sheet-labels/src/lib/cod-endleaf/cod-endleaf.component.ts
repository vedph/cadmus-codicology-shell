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

import {
  AssertedChronotope,
  AssertedChronotopeComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodEndleaf } from '../cod-sheet-labels-part';

@Component({
  selector: 'cadmus-cod-endleaf',
  templateUrl: './cod-endleaf.component.html',
  styleUrls: ['./cod-endleaf.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    AssertedChronotopeComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodEndleafComponent {
  public readonly endleaf = model<CodEndleaf>();

  // cod-endleaf-materials
  public readonly matEntries = input<ThesaurusEntry[]>();
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

  public readonly locations = input<string[]>([]);

  public readonly editorClose = output();

  public location: FormControl<string | null>;
  public material: FormControl<string | null>;
  public chronotope: FormControl<AssertedChronotope | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.location = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.material = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.chronotope = formBuilder.control(null);
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      location: this.location,
      material: this.material,
      chronotope: this.chronotope,
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.endleaf());
    });
  }

  private updateForm(model: CodEndleaf | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.location.setValue(model.location);
    this.material.setValue(model.material);
    this.chronotope.setValue(model.chronotope || null);
    this.note.setValue(model.note || null);
    this.form.markAsPristine();
  }

  public onChronotopeChange(chronotope: AssertedChronotope | undefined): void {
    this.chronotope.setValue(chronotope || null);
    this.chronotope.updateValueAndValidity();
    this.chronotope.markAsDirty();
  }

  private getModel(): CodEndleaf {
    return {
      location: this.location.value?.trim() || '',
      material: this.material.value?.trim() || '',
      chronotope: this.chronotope.value || undefined,
      note: this.note.value?.trim() || undefined,
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.endleaf.set(this.getModel());
  }
}

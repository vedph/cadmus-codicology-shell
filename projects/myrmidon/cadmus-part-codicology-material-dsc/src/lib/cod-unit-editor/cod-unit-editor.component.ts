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
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import {
  AssertedChronotope,
  AssertedChronotopeSetComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodUnit } from '../cod-material-dsc-part';

@Component({
  selector: 'cadmus-cod-unit-editor',
  templateUrl: './cod-unit-editor.component.html',
  styleUrls: ['./cod-unit-editor.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatOption,
    MatCheckbox,
    CodLocationComponent,
    AssertedChronotopeSetComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodUnitEditorComponent {
  public readonly unit = model<CodUnit>();

  // cod-unit-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // cod-unit-materials
  public readonly materialEntries = input<ThesaurusEntry[]>();
  // cod-unit-formats
  public readonly formatEntries = input<ThesaurusEntry[]>();
  // cod-unit-states
  public readonly stateEntries = input<ThesaurusEntry[]>();
  // chronotope-tags
  public readonly ctTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  public eid: FormControl<string | null>;
  public tag: FormControl<string | null>;
  public noGregory: FormControl<boolean>;
  public material: FormControl<string | null>;
  public format: FormControl<string | null>;
  public state: FormControl<string | null>;
  public ranges: FormControl<CodLocationRange[]>;
  public chronotopes: FormControl<AssertedChronotope[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.noGregory = formBuilder.control(false, { nonNullable: true });
    this.material = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.format = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.state = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.ranges = formBuilder.control([], {
      validators: Validators.required,
      nonNullable: true,
    });
    this.chronotopes = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      eid: this.eid,
      tag: this.tag,
      noGregory: this.noGregory,
      material: this.material,
      format: this.format,
      state: this.state,
      ranges: this.ranges,
      chronotopes: this.chronotopes,
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.unit());
    });
  }

  private updateForm(unit: CodUnit | undefined): void {
    if (!unit) {
      this.form.reset();
      return;
    }

    this.eid.setValue(unit.eid || null);
    this.tag.setValue(unit.tag || null);
    this.noGregory.setValue(unit.noGregory ? true : false);
    this.material.setValue(unit.material);
    this.format.setValue(unit.format);
    this.state.setValue(unit.state);
    this.ranges.setValue(unit.ranges || []);
    this.chronotopes.setValue(unit.chronotopes || []);
    this.note.setValue(unit.note || null);
    this.form.markAsPristine();
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onChronotopesChange(chronotopes: AssertedChronotope[]): void {
    this.chronotopes.setValue(chronotopes);
    this.chronotopes.updateValueAndValidity();
    this.chronotopes.markAsDirty();
  }

  private getModel(): CodUnit {
    return {
      eid: this.eid.value?.trim(),
      tag: this.tag.value?.trim(),
      noGregory: this.noGregory.value ? true : false,
      material: this.material.value?.trim() || '',
      format: this.format.value?.trim() || '',
      state: this.state.value?.trim() || '',
      ranges: this.ranges.value,
      chronotopes: this.chronotopes.value?.length
        ? this.chronotopes.value
        : undefined,
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
    this.unit.set(this.getModel());
  }
}

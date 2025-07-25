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
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import {
  PhysicalSize,
  PhysicalSizeComponent,
} from '@myrmidon/cadmus-mat-physical-size';
import {
  AssertedChronotope,
  AssertedChronotopeSetComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodWatermark } from '../cod-watermarks-part';

@Component({
  selector: 'cadmus-cod-watermark-editor',
  templateUrl: './cod-watermark-editor.component.html',
  styleUrls: ['./cod-watermark-editor.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    CodLocationComponent,
    AssertedCompositeIdsComponent,
    MatCheckbox,
    PhysicalSizeComponent,
    AssertedChronotopeSetComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodWatermarkEditorComponent {
  public readonly watermark = model<CodWatermark>();

  // asserted-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // asserted-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();
  // chronotope-tags
  public readonly ctTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // physical-size-tags
  public readonly szTagEntries = input<ThesaurusEntry[]>();
  // physical-size-dim-tags
  public readonly szDimTagEntries = input<ThesaurusEntry[]>();
  // physical-size-units
  public readonly szUnitEntries = input<ThesaurusEntry[]>();

  public editorClose = output();

  public name: FormControl<string | null>;
  public sampleRanges: FormControl<CodLocationRange[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public rangesAsQuire: FormControl<boolean>;
  public description: FormControl<string | null>;
  public ids: FormControl<AssertedCompositeId[]>;
  public hasSize: FormControl<boolean>;
  public size: FormControl<PhysicalSize | null>;
  public chronotopes: FormControl<AssertedChronotope[]>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.name = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.sampleRanges = formBuilder.control([], {
      nonNullable: true,
    });
    this.ranges = formBuilder.control([], { nonNullable: true });
    this.rangesAsQuire = formBuilder.control(false, { nonNullable: true });
    this.description = formBuilder.control(null, Validators.maxLength(5000));
    this.ids = formBuilder.control([], { nonNullable: true });
    this.hasSize = formBuilder.control(false, { nonNullable: true });
    this.size = formBuilder.control(null);
    this.chronotopes = formBuilder.control([], { nonNullable: true });
    this.form = formBuilder.group({
      name: this.name,
      sampleRanges: this.sampleRanges,
      ranges: this.ranges,
      rangesAsQuire: this.rangesAsQuire,
      description: this.description,
      ids: this.ids,
      hasSize: this.hasSize,
      size: this.size,
      chronotopes: this.chronotopes,
    });

    effect(() => {
      this.updateForm(this.watermark());
    });
  }

  private updateForm(model: CodWatermark | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.name.setValue(model.name);
    this.sampleRanges.setValue(model.sampleRange ? [model.sampleRange] : []);
    this.ranges.setValue(model.ranges || []);
    this.rangesAsQuire.setValue(model.rangesAsQuire || false);
    this.ids.setValue(model.ids || []);
    this.size.setValue(model.size || null);
    this.hasSize.setValue(model.size ? true : false);
    this.chronotopes.setValue(model.chronotopes || []);
    this.description.setValue(model.description || null);
    this.form.markAsPristine();
  }

  public onSampleRangesChange(ranges: CodLocationRange[] | null) {
    this.sampleRanges.setValue(ranges || []);
    this.sampleRanges.updateValueAndValidity();
    this.sampleRanges.markAsDirty();
  }

  public onRangesChange(ranges: CodLocationRange[] | null) {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onIdsChange(ids: AssertedCompositeId[]) {
    this.ids.setValue(ids || [], { emitEvent: false });
    this.ids.updateValueAndValidity();
    this.ids.markAsDirty();
  }

  public onSizeChange(size: PhysicalSize | null) {
    this.size.setValue(size);
    this.size.updateValueAndValidity();
    this.size.markAsDirty();
  }

  public onChronotopesChange(chronotopes: AssertedChronotope[]): void {
    this.chronotopes.setValue(chronotopes);
    this.chronotopes.updateValueAndValidity();
    this.chronotopes.markAsDirty();
  }

  private getModel(): CodWatermark {
    return {
      name: this.name.value?.trim() || '',
      sampleRange: this.sampleRanges.value
        ? this.sampleRanges.value[0]
        : undefined,
      ranges: this.ranges.value?.length ? this.ranges.value : undefined,
      rangesAsQuire: this.rangesAsQuire.value ? true : undefined,
      ids: this.ids.value?.length ? this.ids.value : undefined,
      size: this.hasSize.value ? this.size.value || undefined : undefined,
      chronotopes: this.chronotopes.value.length
        ? this.chronotopes.value
        : undefined,
      description: this.description.value?.trim(),
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.watermark.set(this.getModel());
  }
}

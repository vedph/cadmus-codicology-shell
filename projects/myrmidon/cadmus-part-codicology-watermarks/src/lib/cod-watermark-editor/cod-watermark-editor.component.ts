import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PhysicalSize } from '@myrmidon/cadmus-mat-physical-size';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { RankedExternalId } from '@myrmidon/cadmus-refs-external-ids';

import { CodWatermark } from '../cod-watermarks-part';

@Component({
  selector: 'cadmus-cod-watermark-editor',
  templateUrl: './cod-watermark-editor.component.html',
  styleUrls: ['./cod-watermark-editor.component.css'],
})
export class CodWatermarkEditorComponent implements OnInit {
  private _watermark: CodWatermark | undefined;

  @Input()
  public get watermark(): CodWatermark | undefined {
    return this._watermark;
  }
  public set watermark(value: CodWatermark | undefined) {
    this._watermark = value;
    this.updateForm(value);
  }

  // external-id-tags
  @Input()
  public idTagEntries: ThesaurusEntry[] | undefined;
  // external-id-scopes
  @Input()
  public idScopeEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  @Input()
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  @Input()
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  @Input()
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  @Input()
  public refTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-tags
  @Input()
  public szTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-dim-tags
  @Input()
  public szDimTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-units
  @Input()
  public szUnitEntries: ThesaurusEntry[] | undefined;

  @Output()
  public watermarkChange: EventEmitter<CodWatermark>;
  @Output()
  public editorClose: EventEmitter<any>;

  public name: FormControl;
  public sampleRange: FormControl;
  public ranges: FormControl;
  public description: FormControl;
  public ids: FormControl;
  public hasSize: FormControl;
  public size: FormControl;
  public hasChronotope: FormControl;
  public chronotope: FormControl;
  public form: FormGroup;

  public initialSampleRange?: CodLocationRange;
  public initialRanges?: CodLocationRange[];
  public initialIds?: RankedExternalId[];
  public initialSize?: PhysicalSize;
  public initialChronotope?: AssertedChronotope;

  constructor(formBuilder: FormBuilder) {
    this.watermarkChange = new EventEmitter<CodWatermark>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.name = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.sampleRange = formBuilder.control(null, Validators.required);
    this.ranges = formBuilder.control(null);
    this.description = formBuilder.control(null, Validators.maxLength(5000));
    this.ids = formBuilder.control([]);
    this.hasSize = formBuilder.control(false);
    this.size = formBuilder.control(null);
    this.hasChronotope = formBuilder.control(false);
    this.chronotope = formBuilder.control(null);
    this.form = formBuilder.group({
      name: this.name,
      sampleRange: this.sampleRange,
      ranges: this.ranges,
      description: this.description,
      ids: this.ids,
      hasSize: this.hasSize,
      size: this.size,
      hasChronotope: this.hasChronotope,
      chronotope: this.chronotope,
    });
  }

  ngOnInit(): void {
    if (this._watermark) {
      this.updateForm(this._watermark);
    }
  }

  private updateForm(model: CodWatermark | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.name.setValue(model.name);
    this.initialSampleRange = model.sampleRange;
    this.initialRanges = model.ranges;
    this.initialIds = model.ids;
    this.initialSize = model.size;
    this.hasSize.setValue(model.size ? true : false);
    this.initialChronotope = model.chronotope;
    this.hasChronotope.setValue(model.chronotope ? true : false);
    this.description.setValue(model.description);

    this.form.markAsPristine();
  }

  public onSampleRangesChange(ranges: CodLocationRange[] | null) {
    this.sampleRange.setValue(ranges ? ranges[0] : null);
    this.sampleRange.updateValueAndValidity();
    this.sampleRange.markAsDirty();
  }

  public onRangesChange(ranges: CodLocationRange[] | null) {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onIdsChange(ids: RankedExternalId[] | null) {
    this.ids.setValue(ids || []);
    this.ids.updateValueAndValidity();
    this.ids.markAsDirty();
  }

  public onSizeChange(size: PhysicalSize | null) {
    this.size.setValue(size);
    this.size.updateValueAndValidity();
    this.size.markAsDirty();
  }

  public onChronotopeChange(chronotope: AssertedChronotope | null): void {
    this.chronotope.setValue(chronotope);
    this.chronotope.updateValueAndValidity();
    this.chronotope.markAsDirty();
  }

  private getModel(): CodWatermark {
    return {
      name: this.name.value?.trim(),
      sampleRange: this.sampleRange.value,
      ranges: this.ranges.value?.length ? this.ranges.value : undefined,
      ids: this.ids.value?.length ? this.ids.value : undefined,
      size: this.hasSize.value ? this.size.value : undefined,
      chronotope: this.hasChronotope.value ? this.chronotope.value : undefined,
      description: this.description.value?.trim()
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.watermarkChange.emit(this.getModel());
  }
}

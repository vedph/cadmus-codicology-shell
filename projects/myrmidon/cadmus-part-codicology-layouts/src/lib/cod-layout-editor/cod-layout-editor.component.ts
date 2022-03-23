import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import {
  CodLayoutRectSet,
  CodLayoutService,
  COD_LAYOUT_FORMULA_REGEX,
} from '@myrmidon/cadmus-codicology-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PhysicalDimension } from '@myrmidon/cadmus-mat-physical-size';
import { DecoratedCount } from '@myrmidon/cadmus-refs-decorated-counts';
import { NgToolsValidators } from '@myrmidon/ng-tools';

import { CodLayout } from '../cod-layouts-part';

@Component({
  selector: 'cadmus-cod-layout-editor',
  templateUrl: './cod-layout-editor.component.html',
  styleUrls: ['./cod-layout-editor.component.css'],
})
export class CodLayoutEditorComponent implements OnInit {
  private _layout: CodLayout | undefined;

  @Input()
  public get layout(): CodLayout | undefined {
    return this._layout;
  }
  public set layout(value: CodLayout | undefined) {
    this._layout = value;
    this.updateForm(value);
  }

  // cod-layout-tags
  @Input()
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-layout-ruling-techniques
  @Input()
  public rulTechEntries: ThesaurusEntry[] | undefined;
  // cod-layout-derolez
  @Input()
  public drzEntries: ThesaurusEntry[] | undefined;
  // cod-layout-prickings
  @Input()
  public prkEntries: ThesaurusEntry[] | undefined;
  // decorated-count-tags
  @Input()
  public cntTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-dim-tags
  @Input()
  public szDimTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-units
  @Input()
  public szUnitEntries: ThesaurusEntry[] | undefined;

  @Output()
  public layoutChange: EventEmitter<CodLayout>;
  @Output()
  public editorClose: EventEmitter<any>;

  public sample: FormControl;
  public ranges: FormControl;
  public dimensions: FormArray;
  public ruling: FormControl;
  public derolez: FormControl;
  public pricking: FormControl;
  public columnCount: FormControl;
  public counts: FormControl;
  public tag: FormControl;
  public note: FormControl;
  public form: FormGroup;

  public formula: FormControl;
  public formulaForm: FormGroup;
  public formulaError?: string;
  public rectSet: CodLayoutRectSet | undefined;
  public figHeight = 400;

  public initialSample?: CodLocationRange;
  public initialRanges: CodLocationRange[];
  public initialCounts: DecoratedCount[];

  constructor(
    private _formBuilder: FormBuilder,
    private _codLayoutService: CodLayoutService
  ) {
    this.layoutChange = new EventEmitter<CodLayout>();
    this.editorClose = new EventEmitter<any>();
    this.initialRanges = [];
    this.initialCounts = [];
    // form
    this.sample = _formBuilder.control(null, Validators.required);
    this.ranges = _formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.dimensions = _formBuilder.array([]);
    this.ruling = _formBuilder.control(null, Validators.maxLength(50));
    this.derolez = _formBuilder.control(null, Validators.maxLength(50));
    this.pricking = _formBuilder.control(null, Validators.maxLength(50));
    this.columnCount = _formBuilder.control(0);
    this.counts = _formBuilder.control([]);
    this.tag = _formBuilder.control(null, Validators.maxLength(50));
    this.note = _formBuilder.control(null, Validators.maxLength(1000));
    this.form = _formBuilder.group({
      sample: this.sample,
      ranges: this.ranges,
      dimensions: this.dimensions,
      ruling: this.ruling,
      derolez: this.derolez,
      pricking: this.pricking,
      columnCount: this.columnCount,
      counts: this.counts,
      tag: this.tag,
      note: this.note,
    });
    // layout formula
    this.formula = _formBuilder.control(null, [
      Validators.required,
      Validators.pattern(COD_LAYOUT_FORMULA_REGEX),
    ]);
    this.formulaForm = _formBuilder.group({
      formula: this.formula,
    });
  }

  ngOnInit(): void {
    if (this._layout) {
      this.updateForm(this._layout);
    }
  }

  private updateForm(layout: CodLayout | undefined): void {
    if (!layout) {
      this.form.reset();
      return;
    }

    this.initialSample = layout.sample
      ? {
          start: layout.sample,
          end: layout.sample,
        }
      : undefined;
    this.initialRanges = layout.ranges;
    this.ruling.setValue(layout.rulingTechnique);
    this.derolez.setValue(layout.derolez);
    this.pricking.setValue(layout.pricking);
    this.columnCount.setValue(layout.columnCount);
    this.initialCounts = layout.counts || [];
    this.tag.setValue(layout.tag);
    this.note.setValue(layout.note);

    this.dimensions.clear();
    if (layout.dimensions?.length) {
      for (let d of layout.dimensions) {
        this.dimensions.controls.push(this.getDimensionGroup(d));
      }
    }

    // set the formula if at least height is present
    if (layout.dimensions?.find((d) => d.tag === 'height')) {
      this.updateFormula();
      this.applyFormula();
    }

    this.form.markAsPristine();
  }

  //#region Formula
  private getHW(rectSet: CodLayoutRectSet): { height: number; width: number } {
    return {
      height: rectSet.height.reduce((a, b) => {
        return a + b.value;
      }, 0),
      width: rectSet.width.reduce((a, b) => {
        return a + b.value;
      }, 0),
    };
  }

  public updateFormula(): void {
    const map = new Map<string, number>();
    this.dimensions.controls.forEach((g) => {
      const group = g as FormGroup;
      map.set(group.controls['tag'].value, group.controls['value'].value);
    });
    this.formula.setValue(this._codLayoutService.buildFormula(map));
    this.formula.updateValueAndValidity();
    this.formula.markAsDirty();
  }

  /**
   * Apply the MS layout formula by adding all the dimensions got from it.
   */
  public applyFormula(): void {
    // parse
    if (this.formulaForm.invalid) {
      return;
    }
    const result = this._codLayoutService.parseFormula(this.formula.value);
    if (result.error) {
      this.formulaError = result.error.message;
      return;
    } else {
      this.formulaError = undefined;
    }

    // get rectangles
    const map: Map<string, number> = result.value!;
    this.rectSet = {
      height: this._codLayoutService.getHeightRects(map),
      width: this._codLayoutService.getWidthRects(map),
      gap: 4,
    };

    // update dimensions: first collect all the measurements
    // which are not found in the newly got set, nor do NOT belong
    // to a layout formula, so we can preserve them
    const extraDims = new Map<string, PhysicalDimension>();
    this.dimensions.controls.forEach((g) => {
      const group = g as FormGroup;
      if (
        !map.has(group.controls['tag'].value) &&
        !this._codLayoutService.isLayoutMeasure(group.controls['tag'].value)
      ) {
        extraDims.set(
          group.controls['tag'].value,
          group.controls['value'].value
        );
      }
    });

    // then get the sorted formula keys, and add dimensions in order
    this.dimensions.clear();
    const sortedKeys = this._codLayoutService.getSortedKeys(
      this._codLayoutService.getColumnCount(map),
      map
    );
    sortedKeys.forEach((key) => {
      this.dimensions.push(
        this.getDimensionGroup({
          tag: key,
          value: map.get(key)!,
          unit: 'mm',
        })
      );
    });

    // re-add the extra dimensions
    extraDims.forEach((value, key) => {
      this.dimensions.push(
        this.getDimensionGroup({
          tag: key,
          value: value.value,
          unit: value.unit,
        })
      );
    });
    this.dimensions.updateValueAndValidity();
    this.dimensions.markAsDirty();

    // check sum
    const hw = this.getHW(this.rectSet);
    const sb: string[] = [];
    const expHeight = map.get('height');
    const expWidth = map.get('width');
    if (hw.height !== expHeight) {
      sb.push(`expected (${expHeight}) and actual (${hw.height}) height`);
    }
    if (hw.width !== expWidth) {
      sb.push(`expected (${expWidth}) and actual (${hw.width}) width`);
    }
    if (sb.length) {
      sb.splice(0, 0, 'Mismatch: ');
      this.formulaError = sb.join(' - ');
    }
  }

  public onFigSliderChange(change: MatSliderChange): void {
    this.figHeight = change.value!;
  }
  //#endregion

  private getModel(): CodLayout {
    return {
      sample: this.sample.value,
      ranges: this.ranges.value || [],
      dimensions: this.getDimensions(),
      rulingTechnique: this.ruling.value?.trim(),
      derolez: this.derolez.value?.trim(),
      pricking: this.pricking.value?.trim(),
      columnCount: this.columnCount.value || 0,
      counts: this.counts.value?.length ? this.counts.value : undefined,
      tag: this.tag.value?.trim(),
      note: this.note.value?.trim(),
    };
  }

  public onSampleLocationChange(ranges: CodLocationRange[] | null): void {
    this.sample.setValue(ranges?.length ? ranges[0].start : undefined);
    this.sample.updateValueAndValidity();
    this.sample.markAsDirty();
  }

  public onRangeLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  private getDimensionGroup(item?: PhysicalDimension): FormGroup {
    return this._formBuilder.group({
      tag: this._formBuilder.control(item?.tag, Validators.maxLength(50)),
      value: this._formBuilder.control(item?.value || 0, Validators.required),
      unit: this._formBuilder.control(
        item?.unit ??
          (this.szUnitEntries?.length ? this.szUnitEntries[0].id : undefined),
        [Validators.required, Validators.maxLength(50)]
      ),
    });
  }

  public addDimension(item?: PhysicalDimension): void {
    this.dimensions.push(this.getDimensionGroup(item));
    this.dimensions.updateValueAndValidity();
    this.dimensions.markAsDirty();
  }

  public removeDimension(index: number): void {
    this.dimensions.removeAt(index);
    this.dimensions.updateValueAndValidity();
    this.dimensions.markAsDirty();
  }

  public moveDimensionUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.dimensions.controls[index];
    this.dimensions.removeAt(index);
    this.dimensions.insert(index - 1, item);
    this.dimensions.updateValueAndValidity();
    this.dimensions.markAsDirty();
  }

  public moveDimensionDown(index: number): void {
    if (index + 1 >= this.dimensions.length) {
      return;
    }
    const item = this.dimensions.controls[index];
    this.dimensions.removeAt(index);
    this.dimensions.insert(index + 1, item);
    this.dimensions.updateValueAndValidity();
    this.dimensions.markAsDirty();
  }

  private getDimensions(): PhysicalDimension[] | undefined {
    const entries: PhysicalDimension[] = [];
    for (let i = 0; i < this.dimensions.length; i++) {
      const g = this.dimensions.at(i) as FormGroup;
      entries.push({
        tag: g.controls['tag'].value?.trim(),
        value: g.controls['value'].value || 0,
        unit: g.controls['unit'].value?.trim(),
      });
    }
    return entries.length ? entries : undefined;
  }

  public onCountsChange(counts: DecoratedCount[]): void {
    this.counts.setValue(counts);
    this.counts.updateValueAndValidity();
    this.counts.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.layoutChange.emit(this.getModel());
  }
}

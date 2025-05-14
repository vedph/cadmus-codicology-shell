import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  MatFormField,
  MatLabel,
  MatError,
  MatHint,
  MatSuffix,
} from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import {
  DecoratedCount,
  DecoratedCountsComponent,
} from '@myrmidon/cadmus-refs-decorated-counts';
import { PhysicalDimension } from '@myrmidon/cadmus-mat-physical-size';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CodLayoutRectSet,
  CodLayoutService,
  COD_LAYOUT_FORMULA_REGEX,
  CodLayoutFigureComponent,
} from '@myrmidon/cadmus-codicology-ui';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { CodLayout } from '../cod-layouts-part';

const FIG_HEIGHT = 400;

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-layout-editor',
  templateUrl: './cod-layout-editor.component.html',
  styleUrls: ['./cod-layout-editor.component.css'],
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
    MatHint,
    MatIconButton,
    MatTooltip,
    MatSuffix,
    MatIcon,
    MatButton,
    DecoratedCountsComponent,
    MatSlideToggleModule,
    MatSlider,
    MatSliderThumb,
    CodLayoutFigureComponent,
    FlagSetComponent,
  ],
})
export class CodLayoutEditorComponent {
  private _figHasGap = false;

  public readonly layout = model<CodLayout>();

  // cod-layout-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // cod-layout-ruling-techniques
  public rulTechEntries = input<ThesaurusEntry[]>();
  // cod-layout-derolez
  public drzEntries = input<ThesaurusEntry[]>();
  // cod-layout-prickings
  public prkEntries = input<ThesaurusEntry[]>();
  // decorated-count-ids
  public cntIdEntries = input<ThesaurusEntry[]>();
  // decorated-count-tags
  public cntTagEntries = input<ThesaurusEntry[]>();
  // physical-size-dim-tags
  public szDimTagEntries = input<ThesaurusEntry[]>();
  // physical-size-units
  public szUnitEntries = input<ThesaurusEntry[]>();

  public editorClose = output();

  public readonly rulFlags = computed<Flag[]>(
    () => this.rulTechEntries()?.map(entryToFlag) || []
  );

  public sampleRanges: FormControl<CodLocationRange[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public dimensions: FormArray;
  public rulings: FormControl<string[]>;
  public derolez: FormControl<string | null>;
  public pricking: FormControl<string | null>;
  public columnCount: FormControl<number>;
  public counts: FormControl<DecoratedCount[]>;
  public tag: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  public formula: FormControl<string | null>;
  public formulaForm: FormGroup;
  public formulaError?: string;
  public rectSet: CodLayoutRectSet | undefined;
  public figHeight = FIG_HEIGHT;

  constructor(
    private _formBuilder: FormBuilder,
    private _codLayoutService: CodLayoutService
  ) {
    // form
    this.sampleRanges = _formBuilder.control([], {
      nonNullable: true,
    });
    this.ranges = _formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.dimensions = _formBuilder.array([]);
    this.rulings = _formBuilder.control([], { nonNullable: true });
    this.derolez = _formBuilder.control(null, Validators.maxLength(50));
    this.pricking = _formBuilder.control(null, Validators.maxLength(50));
    this.columnCount = _formBuilder.control(0, { nonNullable: true });
    this.counts = _formBuilder.control([], { nonNullable: true });
    this.tag = _formBuilder.control(null, Validators.maxLength(50));
    this.note = _formBuilder.control(null, Validators.maxLength(1000));
    this.form = _formBuilder.group({
      sampleRanges: this.sampleRanges,
      ranges: this.ranges,
      dimensions: this.dimensions,
      rulings: this.rulings,
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

    effect(() => {
      this.updateForm(this.layout());
    });
  }

  private updateForm(layout: CodLayout | undefined): void {
    if (!layout) {
      this.form.reset();
      return;
    }

    this.sampleRanges.setValue(
      layout.sample ? [{ start: layout.sample, end: layout.sample }] : []
    );
    this.ranges.setValue(layout.ranges);
    this.rulings.setValue(layout.rulingTechniques || []);
    this.derolez.setValue(layout.derolez || null);
    this.pricking.setValue(layout.pricking || null);
    this.columnCount.setValue(layout.columnCount);
    this.counts.setValue(layout.counts || []);
    this.counts.setValue(layout.counts || []);
    this.tag.setValue(layout.tag || null);
    this.note.setValue(layout.note || null);

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
      gap: this._figHasGap ? 4 : 0,
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

  public onFigSliderChange(value: number): void {
    this.figHeight = FIG_HEIGHT * value;
  }

  public toggleFigExploded(checked: boolean): void {
    console.log('toggleFigExploded', checked);
    if (!this.rectSet) {
      return;
    }
    this._figHasGap = checked || false;
    this.rectSet = {
      ...this.rectSet,
      gap: checked ? 4 : 0,
    };
  }
  //#endregion

  private getModel(): CodLayout {
    return {
      sample: this.sampleRanges.value[0]?.start,
      ranges: this.ranges.value || [],
      dimensions: this.getDimensions(),
      rulingTechniques: this.rulings.value?.length
        ? this.rulings.value
        : undefined,
      derolez: this.derolez.value?.trim(),
      pricking: this.pricking.value?.trim(),
      columnCount: this.columnCount.value || 0,
      counts: this.counts.value?.length ? this.counts.value : undefined,
      tag: this.tag.value?.trim(),
      note: this.note.value?.trim(),
    };
  }

  public onSampleLocationChange(ranges: CodLocationRange[] | null): void {
    this.sampleRanges.setValue(ranges || []);
    this.sampleRanges.updateValueAndValidity();
    this.sampleRanges.markAsDirty();
  }

  public onRangeLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  private getDimensionGroup(item?: PhysicalDimension): FormGroup {
    return this._formBuilder.group({
      tag: this._formBuilder.control(item?.tag, Validators.maxLength(50)),
      value: this._formBuilder.control(item?.value || 0, Validators.required),
      unit: this._formBuilder.control(
        item?.unit ??
          (this.szUnitEntries()?.length
            ? this.szUnitEntries()![0].id
            : undefined),
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

  public onCheckedIdsChange(ids: string[]): void {
    this.rulings.setValue(ids);
    this.rulings.updateValueAndValidity();
    this.rulings.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.layout.set(this.getModel());
  }
}

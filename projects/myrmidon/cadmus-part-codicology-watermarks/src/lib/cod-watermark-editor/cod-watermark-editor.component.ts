import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
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
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { CodWatermark } from '../cod-watermarks-part';

interface CodWatermarkControls {
  name: string;
  sampleRanges: CodLocationRange[];
  ranges: CodLocationRange[];
  rangesAsQuire: boolean;
  description: string;
  ids: AssertedCompositeId[];
  hasSize: boolean;
  size: PhysicalSize | null;
  chronotopes: AssertedChronotope[];
}

function toDraft(model?: CodWatermark): CodWatermarkControls {
  return {
    name: model?.name || '',
    sampleRanges: model?.sampleRange
      ? copyFormValue([model.sampleRange])
      : [],
    ranges: copyFormValue(model?.ranges || []),
    rangesAsQuire: model?.rangesAsQuire || false,
    description: model?.description || '',
    ids: copyFormValue(model?.ids || []),
    hasSize: model?.size ? true : false,
    size: copyFormValue(model?.size) || null,
    chronotopes: copyFormValue(model?.chronotopes || []),
  };
}

@Component({
  selector: 'cadmus-cod-watermark-editor',
  templateUrl: './cod-watermark-editor.component.html',
  styleUrls: ['./cod-watermark-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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

  private readonly _draft = linkedSignal(() => toDraft(this.watermark()));
  public readonly form = form(this._draft, (p) => {
    required(p.name);
    maxLength(p.name, 50);
    maxLength(p.description, 5000);
  });

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

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public editorClose = output();

  constructor() {
    // new watermark: clear the interaction state
    effect(() => {
      this.watermark();
      untracked(() => this.form().reset());
    });
  }

  public onSampleRangesChange(ranges: CodLocationRange[] | null) {
    // ignore emissions not changing the location (the location editor
    // emits its initial value when initialized)
    if (
      (CodLocationParser.rangesToString(ranges as CodLocationRange[] | null) || '') ===
      (CodLocationParser.rangesToString(this.form.sampleRanges().value()) || '')
    ) {
      return;
    }
    this.form.sampleRanges().value.set(copyFormValue(ranges || []));
    this.form.sampleRanges().markAsDirty();
  }

  public onRangesChange(ranges: CodLocationRange[] | null) {
    // ignore emissions not changing the location (the location editor
    // emits its initial value when initialized)
    if (
      (CodLocationParser.rangesToString(ranges as CodLocationRange[] | null) || '') ===
      (CodLocationParser.rangesToString(this.form.ranges().value()) || '')
    ) {
      return;
    }
    this.form.ranges().value.set(copyFormValue(ranges || []));
    this.form.ranges().markAsDirty();
  }

  public onIdsChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.ids, copyFormValue(ids || []));
  }

  public onSizeChange(size: PhysicalSize | null): void {
    setFieldFromChild(this.form.size, copyFormValue(size) || null);
  }

  public onChronotopesChange(chronotopes: AssertedChronotope[]): void {
    setFieldFromChild(this.form.chronotopes, copyFormValue(chronotopes || []));
  }

  private getModel(): CodWatermark {
    const draft = this._draft();
    return {
      name: draft.name.trim(),
      sampleRange: copyFormValue(draft.sampleRanges[0]),
      ranges: draft.ranges.length ? copyFormValue(draft.ranges) : undefined,
      rangesAsQuire: draft.rangesAsQuire ? true : undefined,
      ids: draft.ids.length ? copyFormValue(draft.ids) : undefined,
      size: draft.hasSize ? copyFormValue(draft.size) || undefined : undefined,
      chronotopes: draft.chronotopes.length
        ? copyFormValue(draft.chronotopes)
        : undefined,
      description: draft.description.trim() || undefined,
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public onEnterKey(event: Event): void {
    if (
      !isImplicitSubmission(event) ||
      this.form().invalid() ||
      !this.form().dirty()
    ) {
      return;
    }
    event.preventDefault();
    this.save();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.watermark.set(this.getModel());
  }
}

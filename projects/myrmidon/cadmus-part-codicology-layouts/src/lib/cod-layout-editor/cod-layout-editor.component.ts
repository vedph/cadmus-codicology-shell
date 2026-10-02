import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { form, FormField, max, maxLength, min } from '@angular/forms/signals';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';
import {
  DecoratedCount,
  DecoratedCountsComponent,
} from '@myrmidon/cadmus-refs-decorated-counts';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import {
  CodLayoutFormulaComponent,
  CodLayoutFormulaWithDimensions,
} from '@myrmidon/cadmus-codicology-ui';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { CodLayout } from '../cod-layouts-part';
import { MatSnackBar } from '@angular/material/snack-bar';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface CodLayoutControls {
  sampleRanges: CodLocationRange[];
  ranges: CodLocationRange[];
  rulings: string[];
  derolez: string;
  pricking: string;
  columnCount: number | null;
  counts: DecoratedCount[];
  tag: string;
  note: string;
  // edited by the formula editor
  formula: CodLayoutFormulaWithDimensions | null;
}

function toDraft(layout?: CodLayout): CodLayoutControls {
  return {
    sampleRanges: layout?.sample
      ? copyFormValue([{ start: layout.sample, end: layout.sample }])
      : [],
    ranges: copyFormValue(layout?.ranges || []),
    rulings: [...(layout?.rulingTechniques || [])],
    derolez: layout?.derolez || '',
    pricking: layout?.pricking || '',
    columnCount: layout?.columnCount ?? null,
    counts: copyFormValue(layout?.counts || []),
    tag: layout?.tag || '',
    note: layout?.note || '',
    formula: layout
      ? {
          formula: layout.formula || '',
          dimensions: copyFormValue(layout.dimensions || []),
        }
      : null,
  };
}

@Component({
  selector: 'cadmus-cod-layout-editor',
  templateUrl: './cod-layout-editor.component.html',
  styleUrls: ['./cod-layout-editor.component.css'],
  imports: [
    FormField,
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
    DecoratedCountsComponent,
    MatSlideToggleModule,
    FlagSetComponent,
    CodLayoutFormulaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodLayoutEditorComponent {
  private readonly _snackbar = inject(MatSnackBar);

  public readonly layout = model<CodLayout>();

  private readonly _draft = linkedSignal(() => toDraft(this.layout()));
  public readonly form = form(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.ranges, 1);
    maxLength(p.derolez, 50);
    min(p.columnCount, 0);
    max(p.columnCount, 18);
    maxLength(p.pricking, 50);
    maxLength(p.tag, 50);
    maxLength(p.note, 1000);
  });

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

  public editorClose = output();

  public readonly rulFlags = computed<Flag[]>(
    () => this.rulTechEntries()?.map(entryToFlag) || []
  );


  constructor() {
    // new layout: clear the interaction state
    effect(() => {
      this.layout();
      untracked(() => this.form().reset());
    });
  }

  public onFormulaChange(data: CodLayoutFormulaWithDimensions): void {
    // remove ordinal property from dimensions if present
    const cleanedData = {
      ...data,
      dimensions:
        data.dimensions?.map((dimension) => {
          const { ordinal, ...cleanDimension } = dimension as any;
          return cleanDimension;
        }) || [],
    };

    this.form.formula().value.set(cleanedData);
    this.form.formula().markAsDirty();
    this._snackbar.open('Formula updated', 'OK', { duration: 2000 });
  }

  private getLayout(): CodLayout {
    const draft = this._draft();
    return {
      sample: copyFormValue(draft.sampleRanges[0]?.start),
      ranges: copyFormValue(draft.ranges),
      formula: draft.formula?.formula || undefined,
      dimensions: copyFormValue(draft.formula?.dimensions) || undefined,
      rulingTechniques: draft.rulings.length ? [...draft.rulings] : undefined,
      derolez: draft.derolez.trim() || undefined,
      pricking: draft.pricking.trim() || undefined,
      columnCount: draft.columnCount || 0,
      counts: draft.counts.length ? copyFormValue(draft.counts) : undefined,
      tag: draft.tag.trim() || undefined,
      note: draft.note.trim() || undefined,
    };
  }

  public onSampleLocationChange(ranges: CodLocationRange[] | null): void {
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

  public onRangeLocationChange(ranges: CodLocationRange[] | null): void {
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

  public onCountsChange(counts: DecoratedCount[]): void {
    setFieldFromChild(this.form.counts, copyFormValue(counts || []));
  }

  public onCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.rulings, [...(ids || [])]);
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
    this.layout.set(this.getLayout());
  }
}

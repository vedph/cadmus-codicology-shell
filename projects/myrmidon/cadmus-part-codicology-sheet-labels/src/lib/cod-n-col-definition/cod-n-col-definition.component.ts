import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { form, FormField, maxLength, required, min } from '@angular/forms/signals';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import {
  HistoricalDateModel,
  HistoricalDateComponent,
} from '@myrmidon/cadmus-refs-historical-date';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import {
  CodLocationComponent,
  CodLocationRange,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';

import { CodNColDefinition } from '../cod-sheet-labels-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface CodNColDefinitionControls {
  rank: number | null;
  isPagination: boolean;
  isByScribe: boolean;
  system: string;
  technique: string;
  position: string;
  colors: string[];
  hasDate: boolean;
  date: HistoricalDateModel | null;
  canonicalRanges: CodLocationRange[];
  links: AssertedCompositeId[];
  note: string;
}

function toDraft(model?: CodNColDefinition): CodNColDefinitionControls {
  return {
    rank: model?.rank || 0,
    isPagination: model?.isPagination || false,
    isByScribe: model?.isByScribe || false,
    system: model?.system || '',
    technique: model?.technique || '',
    position: model?.position || '',
    colors: [...(model?.colors || [])],
    hasDate: model?.date ? true : false,
    date: copyFormValue(model?.date) || null,
    canonicalRanges: copyFormValue(model?.canonicalRanges || []),
    links: copyFormValue(model?.links || []),
    note: model?.note || '',
  };
}

@Component({
  selector: 'cadmus-cod-n-col-definition',
  templateUrl: './cod-n-col-definition.component.html',
  styleUrls: ['./cod-n-col-definition.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatCheckbox,
    MatSelect,
    MatOption,
    MatError,
    FlagSetComponent,
    HistoricalDateComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
    AssertedCompositeIdsComponent,
    CodLocationComponent,
  ],
})
export class CodNColDefinitionComponent {
  public readonly definition = model<CodNColDefinition>();

  private readonly _draft = linkedSignal(() => toDraft(this.definition()));
  public readonly form = form(this._draft, (p) => {
    min(p.rank, 0);
    required(p.system);
    maxLength(p.system, 50);
    required(p.technique);
    maxLength(p.technique, 50);
    required(p.position);
    maxLength(p.position, 50);
    maxLength(p.note, 1000);
  });

  // cod-numbering-systems
  public readonly sysEntries = input<ThesaurusEntry[]>();
  // cod-numbering-techniques
  public readonly techEntries = input<ThesaurusEntry[]>();
  // cod-numbering-positions
  public readonly posEntries = input<ThesaurusEntry[]>();
  // cod-numbering-colors
  public readonly clrEntries = input<ThesaurusEntry[]>();

  // links:
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // external-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // external-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public readonly editorClose = output();

  // the ID of the bound definition
  public readonly id = computed<string>(() => this.definition()?.id || '');

  // flags
  public readonly colorFlags = computed<Flag[]>(
    () => this.clrEntries()?.map(entryToFlag) || [],
  );

  constructor() {
    // new definition: clear the interaction state
    effect(() => {
      this.definition();
      untracked(() => this.form().reset());
    });
  }

  private getModel(): CodNColDefinition {
    const draft = this._draft();
    return {
      id: this.id(),
      rank: draft.rank || 0,
      isPagination: draft.isPagination ? true : undefined,
      isByScribe: draft.isByScribe ? true : undefined,
      system: draft.system.trim(),
      technique: draft.technique.trim(),
      position: draft.position.trim(),
      colors: draft.colors.length ? [...draft.colors] : undefined,
      date: draft.hasDate ? copyFormValue(draft.date) || undefined : undefined,
      canonicalRanges: draft.canonicalRanges.length ? copyFormValue(draft.canonicalRanges) : undefined,
      links: draft.links.length ? copyFormValue(draft.links) : undefined,
      note: draft.note.trim() || undefined,
    };
  }

  public onColorIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.colors, [...(ids || [])]);
  }

  public onDateChange(date: HistoricalDateModel): void {
    setFieldFromChild(this.form.date, copyFormValue(date) || null);
  }

  public onLinkIdsChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.links, copyFormValue(ids || []));
  }

  public onRangeChange(ranges: CodLocationRange[]): void {
    // ignore emissions not changing the location (the location editor
    // emits its initial value when initialized)
    if (
      (CodLocationParser.rangesToString(ranges as CodLocationRange[] | null) || '') ===
      (CodLocationParser.rangesToString(this.form.canonicalRanges().value()) || '')
    ) {
      return;
    }
    this.form.canonicalRanges().value.set(ranges);
    this.form.canonicalRanges().markAsDirty();
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
    this.definition.set(this.getModel());
  }
}

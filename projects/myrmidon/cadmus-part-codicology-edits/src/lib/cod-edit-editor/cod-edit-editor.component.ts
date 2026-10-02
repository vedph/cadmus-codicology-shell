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
import { form, FormField, maxLength, required } from '@angular/forms/signals';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import {
  LookupDocReferencesComponent,
  LookupProviderOptions,
} from '@myrmidon/cadmus-refs-lookup';
import {
  HistoricalDateModel,
  HistoricalDateComponent,
} from '@myrmidon/cadmus-refs-historical-date';

import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { CodEdit } from '../cod-edits-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface CodEditControls {
  eid: string;
  type: string;
  tag: string;
  authorIds: AssertedCompositeId[];
  techniques: string[];
  ranges: CodLocationRange[];
  position: string;
  language: string;
  hasDate: boolean;
  date: HistoricalDateModel | null;
  colors: string[];
  description: string;
  text: string;
  references: DocReference[];
}

function toDraft(edit?: CodEdit): CodEditControls {
  return {
    eid: edit?.eid || '',
    type: edit?.type || '',
    tag: edit?.tag || '',
    authorIds: copyFormValue(edit?.authorIds || []),
    techniques: [...(edit?.techniques || [])],
    ranges: copyFormValue(edit?.ranges || []),
    position: edit?.position || '',
    language: edit?.language || '',
    hasDate: edit?.date ? true : false,
    date: copyFormValue(edit?.date) || null,
    colors: [...(edit?.colors || [])],
    description: edit?.description || '',
    text: edit?.text || '',
    references: copyFormValue(edit?.references || []),
  };
}

@Component({
  selector: 'cadmus-cod-edit-editor',
  templateUrl: './cod-edit-editor.component.html',
  styleUrls: ['./cod-edit-editor.component.css'],
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatOption,
    CodLocationComponent,
    AssertedCompositeIdsComponent,
    FlagSetComponent,
    MatCheckbox,
    HistoricalDateComponent,
    LookupDocReferencesComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodEditEditorComponent {
  public readonly edit = model<CodEdit>();

  private readonly _draft = linkedSignal(() => toDraft(this.edit()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.eid, 100);
    required(p.type);
    maxLength(p.type, 50);
    maxLength(p.tag, 50);
    NgxToolsSignalValidators.strictMinLength(p.ranges, 1);
    maxLength(p.position, 50);
    maxLength(p.language, 50);
    maxLength(p.description, 1000);
    maxLength(p.text, 1000);
  });

  // cod-edit-colors
  public readonly colorEntries = input<ThesaurusEntry[]>();
  // cod-edit-techniques
  public readonly techEntries = input<ThesaurusEntry[]>();
  // cod-edit-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // cod-edit-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // cod-edit-positions
  public readonly posEntries = input<ThesaurusEntry[]>();
  // cod-edit-languages
  public readonly langEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // external-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // external-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public editorClose = output();

  // flags
  public readonly colorFlags = computed<Flag[]>(() => {
    return this.colorEntries()?.map(entryToFlag) || [];
  });
  public readonly techniqueFlags = computed<Flag[]>(() => {
    return this.techEntries()?.map(entryToFlag) || [];
  });

  constructor() {
    // new edit: clear the interaction state
    effect(() => {
      this.edit();
      untracked(() => this.form().reset());
    });
  }

  private getEdit(): CodEdit {
    const draft = this._draft();
    return {
      eid: draft.eid.trim() || undefined,
      type: draft.type.trim(),
      tag: draft.tag.trim() || undefined,
      authorIds: draft.authorIds.length ? copyFormValue(draft.authorIds) : undefined,
      techniques: [...draft.techniques],
      ranges: copyFormValue(draft.ranges),
      position: draft.position.trim() || undefined,
      language: draft.language.trim() || undefined,
      date: draft.hasDate ? copyFormValue(draft.date) || undefined : undefined,
      colors: [...draft.colors],
      description: draft.description.trim() || undefined,
      text: draft.text.trim() || undefined,
      references: draft.references.length ? copyFormValue(draft.references) : undefined,
    };
  }

  public onAuthorIdsChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.authorIds, copyFormValue(ids || []));
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    // ignore emissions not changing the location (the location editor
    // emits its initial value when initialized)
    if (
      (CodLocationParser.rangesToString(ranges) || '') ===
      (CodLocationParser.rangesToString(this.form.ranges().value()) || '')
    ) {
      return;
    }
    this.form.ranges().value.set(copyFormValue(ranges || []));
    this.form.ranges().markAsDirty();
  }

  public onColorIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.colors, [...(ids || [])]);
  }

  public onTechniqueIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.techniques, [...(ids || [])]);
  }

  public onReferencesChange(references: DocReference[]): void {
    setFieldFromChild(this.form.references, copyFormValue(references || []));
  }

  public onDateChange(date: HistoricalDateModel): void {
    setFieldFromChild(this.form.date, copyFormValue(date) || null);
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
    this.edit.set(this.getEdit());
  }
}

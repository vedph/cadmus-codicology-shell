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
import { form, FormField, maxLength } from '@angular/forms/signals';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';
import {
  AssertedChronotope,
  AssertedChronotopeComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { CodPalimpsest } from '../cod-material-dsc-part';

interface CodPalimpsestControls {
  ranges: CodLocationRange[];
  chronotope: AssertedChronotope | null;
  note: string;
}

function toDraft(palimpsest?: CodPalimpsest): CodPalimpsestControls {
  return {
    ranges: copyFormValue(palimpsest?.ranges || []),
    chronotope: copyFormValue(palimpsest?.chronotope) || null,
    note: palimpsest?.note || '',
  };
}

@Component({
  selector: 'cadmus-cod-palimpsest-editor',
  templateUrl: './cod-palimpsest-editor.component.html',
  styleUrls: ['./cod-palimpsest-editor.component.css'],
  imports: [
    FormField,
    CodLocationComponent,
    AssertedChronotopeComponent,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodPalimpsestEditorComponent {
  public readonly palimpsest = model<CodPalimpsest>();

  private readonly _draft = linkedSignal(() => toDraft(this.palimpsest()));
  public readonly form = form(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.ranges, 1);
    maxLength(p.note, 1000);
  });

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

  public readonly editorClose = output();

  constructor() {
    // new palimpsest: clear the interaction state
    effect(() => {
      this.palimpsest();
      untracked(() => this.form().reset());
    });
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
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

  public onChronotopeChange(chronotope: AssertedChronotope | null): void {
    setFieldFromChild(this.form.chronotope, copyFormValue(chronotope) || null);
  }

  private getModel(): CodPalimpsest {
    const draft = this._draft();
    return {
      ranges: copyFormValue(draft.ranges),
      chronotope: copyFormValue(draft.chronotope)!,
      note: draft.note.trim() || undefined,
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
    this.palimpsest.set(this.getModel());
  }
}

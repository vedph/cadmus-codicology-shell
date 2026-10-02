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
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';
import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';

import {
  AssertedChronotope,
  AssertedChronotopeSetComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { CodUnit } from '../cod-material-dsc-part';

interface CodUnitControls {
  eid: string;
  tag: string;
  noGregory: boolean;
  material: string;
  format: string;
  state: string;
  ranges: CodLocationRange[];
  chronotopes: AssertedChronotope[];
  note: string;
}

function toDraft(unit?: CodUnit): CodUnitControls {
  return {
    eid: unit?.eid || '',
    tag: unit?.tag || '',
    noGregory: unit?.noGregory ? true : false,
    material: unit?.material || '',
    format: unit?.format || '',
    state: unit?.state || '',
    ranges: copyFormValue(unit?.ranges || []),
    chronotopes: copyFormValue(unit?.chronotopes || []),
    note: unit?.note || '',
  };
}

@Component({
  selector: 'cadmus-cod-unit-editor',
  templateUrl: './cod-unit-editor.component.html',
  styleUrls: ['./cod-unit-editor.component.css'],
  imports: [
    FormField,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodUnitEditorComponent {
  public readonly unit = model<CodUnit>();

  private readonly _draft = linkedSignal(() => toDraft(this.unit()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.eid, 100);
    maxLength(p.tag, 50);
    required(p.material);
    maxLength(p.material, 50);
    maxLength(p.format, 50);
    maxLength(p.state, 50);
    // required() does not flag an empty array, Validators.required did
    NgxToolsSignalValidators.strictMinLength(p.ranges, 1);
    maxLength(p.note, 1000);
  });
  // hide format field by default as it is obsoleted in the model
  // but we must ensure backwards compatibility.
  public readonly noFormat = input<boolean>(true);

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

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public readonly editorClose = output();

  constructor() {
    // new unit: clear the interaction state
    effect(() => {
      this.unit();
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

  public onChronotopesChange(chronotopes: AssertedChronotope[]): void {
    setFieldFromChild(this.form.chronotopes, copyFormValue(chronotopes || []));
  }

  private getModel(): CodUnit {
    const draft = this._draft();
    return {
      eid: draft.eid.trim() || undefined,
      tag: draft.tag.trim() || undefined,
      noGregory: draft.noGregory ? true : false,
      material: draft.material.trim(),
      format: draft.format.trim() || undefined,
      state: draft.state.trim() || undefined,
      ranges: copyFormValue(draft.ranges),
      chronotopes: draft.chronotopes.length ? copyFormValue(draft.chronotopes) : undefined,
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
    this.unit.set(this.getModel());
  }
}

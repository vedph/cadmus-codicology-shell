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
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

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

import { CodEndleaf } from '../cod-sheet-labels-part';

interface CodEndleafControls {
  location: string;
  material: string;
  chronotope: AssertedChronotope | null;
  note: string;
}

function toDraft(model?: CodEndleaf): CodEndleafControls {
  return {
    location: model?.location || '',
    material: model?.material || '',
    chronotope: copyFormValue(model?.chronotope) || null,
    note: model?.note || '',
  };
}

@Component({
  selector: 'cadmus-cod-endleaf',
  templateUrl: './cod-endleaf.component.html',
  styleUrls: ['./cod-endleaf.component.css'],
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    AssertedChronotopeComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodEndleafComponent {
  public readonly endleaf = model<CodEndleaf>();

  private readonly _draft = linkedSignal(() => toDraft(this.endleaf()));
  public readonly form = form(this._draft, (p) => {
    required(p.location);
    maxLength(p.location, 50);
    required(p.material);
    maxLength(p.material, 50);
    maxLength(p.note, 1000);
  });

  // cod-endleaf-materials
  public readonly matEntries = input<ThesaurusEntry[]>();
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

  public readonly locations = input<string[]>([]);

  public readonly editorClose = output();

  constructor() {
    // new endleaf: clear the interaction state
    effect(() => {
      this.endleaf();
      untracked(() => this.form().reset());
    });
  }

  public onChronotopeChange(chronotope: AssertedChronotope | undefined): void {
    setFieldFromChild(this.form.chronotope, copyFormValue(chronotope) || null);
  }

  private getModel(): CodEndleaf {
    const draft = this._draft();
    return {
      location: draft.location.trim(),
      material: draft.material.trim(),
      chronotope: copyFormValue(draft.chronotope) || undefined,
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
    this.endleaf.set(this.getModel());
  }
}

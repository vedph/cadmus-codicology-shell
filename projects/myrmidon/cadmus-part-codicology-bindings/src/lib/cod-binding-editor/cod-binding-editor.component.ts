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
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import {
  PhysicalSize,
  PhysicalSizeComponent,
} from '@myrmidon/cadmus-mat-physical-size';

import {
  AssertedChronotope,
  AssertedChronotopeComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';

import { CodBinding } from '../cod-bindings-part';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

interface CodBindingControls {
  tag: string;
  coverMaterial: string;
  boardMaterial: string;
  chronotope: AssertedChronotope | null;
  size: PhysicalSize | null;
  hasSize: boolean;
  description: string;
}

function toDraft(binding?: CodBinding): CodBindingControls {
  return {
    tag: binding?.tag || '',
    coverMaterial: binding?.coverMaterial || '',
    boardMaterial: binding?.boardMaterial || '',
    chronotope: copyFormValue(binding?.chronotope) || null,
    size: copyFormValue(binding?.size) || null,
    hasSize: !!binding?.size,
    description: binding?.description || '',
  };
}

@Component({
  selector: 'cadmus-cod-binding-editor',
  templateUrl: './cod-binding-editor.component.html',
  styleUrls: ['./cod-binding-editor.component.css'],
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatError,
    MatCheckbox,
    PhysicalSizeComponent,
    AssertedChronotopeComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodBindingEditorComponent {
  public readonly binding = model<CodBinding>();

  // cod-binding-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // cod-binding-cover-materials
  public readonly coverEntries = input<ThesaurusEntry[]>();
  // cod-binding-board-materials
  public readonly boardEntries = input<ThesaurusEntry[]>();
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

  public readonly editorClose = output();

  private readonly _draft = linkedSignal(() => toDraft(this.binding()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.tag, 50);
    required(p.coverMaterial);
    maxLength(p.coverMaterial, 50);
    required(p.boardMaterial);
    maxLength(p.boardMaterial, 50);
    required(p.chronotope);
    maxLength(p.description, 5000);
  });

  constructor() {
    // new binding: clear the interaction state
    effect(() => {
      this.binding();
      untracked(() => this.form().reset());
    });
  }

  private getBinding(): CodBinding {
    const draft = this._draft();
    return {
      tag: draft.tag.trim() || undefined,
      coverMaterial: draft.coverMaterial.trim(),
      boardMaterial: draft.boardMaterial.trim(),
      chronotope: copyFormValue(draft.chronotope)!,
      size: draft.hasSize ? copyFormValue(draft.size) || undefined : undefined,
      description: draft.description.trim() || undefined,
    };
  }

  public onSizeChange(size: PhysicalSize | undefined): void {
    setFieldFromChild(this.form.size, copyFormValue(size) || null);
  }

  public onChronotopeChange(chronotope: AssertedChronotope | undefined): void {
    setFieldFromChild(this.form.chronotope, copyFormValue(chronotope) || null);
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
    this.binding.set(this.getBinding());
  }
}

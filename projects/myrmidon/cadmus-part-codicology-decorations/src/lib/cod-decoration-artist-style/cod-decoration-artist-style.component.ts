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
  AssertedChronotope,
  AssertedChronotopeComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import { Assertion, AssertionComponent } from '@myrmidon/cadmus-refs-assertion';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { CodDecorationArtistStyle } from '../cod-decorations-part';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

interface CodDecorationArtistStyleControls {
  name: string;
  hasChronotope: boolean;
  chronotope: AssertedChronotope | null;
  hasAssertion: boolean;
  assertion: Assertion | null;
}

function toDraft(
  style?: CodDecorationArtistStyle,
): CodDecorationArtistStyleControls {
  return {
    name: style?.name || '',
    hasChronotope: !!style?.chronotope,
    chronotope: copyFormValue(style?.chronotope) || null,
    hasAssertion: !!style?.assertion,
    assertion: copyFormValue(style?.assertion) || null,
  };
}

@Component({
  selector: 'cadmus-cod-decoration-artist-style',
  templateUrl: './cod-decoration-artist-style.component.html',
  styleUrls: ['./cod-decoration-artist-style.component.css'],
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatCheckbox,
    AssertedChronotopeComponent,
    AssertionComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodDecorationArtistStyleComponent {
  public readonly style = model<CodDecorationArtistStyle>();

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

  private readonly _draft = linkedSignal(() => toDraft(this.style()));
  public readonly form = form(this._draft, (p) => {
    required(p.name);
    maxLength(p.name, 50);
  });

  constructor() {
    // new style: clear the interaction state
    effect(() => {
      this.style();
      untracked(() => this.form().reset());
    });
  }

  public onChronotopeChange(chronotope: AssertedChronotope | undefined): void {
    setFieldFromChild(this.form.chronotope, copyFormValue(chronotope) || null);
  }

  public onAssertionChange(assertion: Assertion | undefined): void {
    setFieldFromChild(this.form.assertion, copyFormValue(assertion) || null);
  }

  private getStyle(): CodDecorationArtistStyle {
    const draft = this._draft();
    return {
      name: draft.name.trim(),
      chronotope: draft.hasChronotope
        ? copyFormValue(draft.chronotope) || undefined
        : undefined,
      assertion: draft.hasAssertion
        ? copyFormValue(draft.assertion) || undefined
        : undefined,
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
    this.style.set(this.getStyle());
  }
}

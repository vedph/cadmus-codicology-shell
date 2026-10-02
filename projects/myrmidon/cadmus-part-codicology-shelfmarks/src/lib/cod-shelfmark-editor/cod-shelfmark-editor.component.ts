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
import { disabled, form, FormField, maxLength } from '@angular/forms/signals';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';

import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
} from '@myrmidon/cadmus-ui';

import { CodShelfmark } from '../cod-shelfmarks-part';

interface CodShelfmarkControls {
  tag: string;
  city: string;
  library: string;
  fund: string;
  location: string;
}

function toDraft(model?: CodShelfmark): CodShelfmarkControls {
  return {
    tag: model?.tag || '',
    city: model?.city || '',
    library: model?.library || '',
    fund: model?.fund || '',
    location: model?.location || '',
  };
}

@Component({
  selector: 'cadmus-cod-shelfmark-editor',
  templateUrl: './cod-shelfmark-editor.component.html',
  styleUrls: ['./cod-shelfmark-editor.component.css'],
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatError,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodShelfmarkEditorComponent {
  public readonly shelfmark = model<CodShelfmark>();

  private readonly _draft = linkedSignal(() => toDraft(this.shelfmark()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.tag, 50);
    maxLength(p.city, 100);
    maxLength(p.library, 100);
    maxLength(p.fund, 100);
    maxLength(p.location, 100);
    // the city is extracted from the library, when configured
    disabled(p.city, () => this.shouldExtractCity());
  });

  // cod-shelfmark-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // cod-shelfmark-cities
  public readonly cityEntries = input<ThesaurusEntry[]>();
  // cod-shelfmark-libraries
  public readonly libEntries = input<ThesaurusEntry[]>();
  /**
   * The optional regular expression pattern used to extract the city from
   * the library name. In this case, city will be disabled in the shelfmark
   * editor and it will be extracted from the library when selected.
   * For instance, you might set this to `\(([^)]+)\)$` to extract the city
   * from library names like "Marciana (Venice)" or "Nazionale (Florence)".
   */
  public readonly cityFromLibPattern = input<string | undefined>(undefined);

  public editorClose = output();

  /**
   * Computed signal to determine if city should be extracted from library.
   */
  public readonly shouldExtractCity = computed(() => {
    const pattern = this.cityFromLibPattern();
    const entries = this.libEntries();
    return pattern !== undefined && entries !== undefined && entries.length > 0;
  });

  /**
   * Extract city from library name using the cityFromLibPattern.
   * @param libraryId The library ID to look up in libEntries.
   */
  constructor() {
    // new shelfmark: clear the interaction state
    effect(() => {
      this.shelfmark();
      untracked(() => this.form().reset());
    });

    // extract the city from the library, when configured: whenever the
    // library changes (also when a shelfmark is bound) or extraction gets
    // enabled
    effect(() => {
      const library = this.form.library().value();
      if (this.shouldExtractCity() && library) {
        untracked(() => this.extractAndSetCity(library));
      }
    });
  }

  private extractAndSetCity(libraryId: string): void {
    const pattern = this.cityFromLibPattern();
    const entries = this.libEntries();

    if (!pattern || !entries) {
      return;
    }

    // find the library entry by ID
    const entry = entries.find((e) => e.id === libraryId);
    if (!entry) {
      return;
    }

    // extract city from library name using the pattern
    try {
      const regex = new RegExp(pattern);
      const match = regex.exec(entry.value);

      if (match && match[1]) {
        // set the city value to the first captured group
        this.form.city().value.set(match[1].trim());
      } else {
        // clear city if no match found
        this.form.city().value.set('');
      }
    } catch (error) {
      console.error('Invalid cityFromLibPattern regex:', error);
      console.error('Pattern:', pattern);
      console.error('Library value:', entry.value);
    }
  }

  private getModel(): CodShelfmark {
    const draft = this._draft();
    return {
      tag: draft.tag.trim() || undefined,
      // the city value is saved also when disabled
      city: draft.city.trim() || undefined,
      library: draft.library.trim() || undefined,
      fund: draft.fund.trim() || undefined,
      location: draft.location.trim() || undefined,
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
    this.shelfmark.set(this.getModel());
  }
}

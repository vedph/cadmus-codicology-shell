import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  output,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';

import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodShelfmark } from '../cod-shelfmarks-part';

@Component({
  selector: 'cadmus-cod-shelfmark-editor',
  templateUrl: './cod-shelfmark-editor.component.html',
  styleUrls: ['./cod-shelfmark-editor.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
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

  public tag: FormControl<string | null>;
  public city: FormControl<string | null>;
  public library: FormControl<string | null>;
  public fund: FormControl<string | null>;
  public location: FormControl<string | null>;
  public form: FormGroup;

  /**
   * Computed signal to determine if city should be extracted from library.
   */
  public readonly shouldExtractCity = computed(() => {
    const pattern = this.cityFromLibPattern();
    const entries = this.libEntries();
    return pattern !== undefined && entries !== undefined && entries.length > 0;
  });

  constructor(formBuilder: FormBuilder) {
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.city = formBuilder.control(null, Validators.maxLength(100));
    this.library = formBuilder.control(null, Validators.maxLength(100));
    this.fund = formBuilder.control(null, Validators.maxLength(100));
    this.location = formBuilder.control(null, Validators.maxLength(100));

    this.form = formBuilder.group({
      tag: this.tag,
      city: this.city,
      library: this.library,
      fund: this.fund,
      location: this.location,
    });

    // convert library value changes to a signal
    const libraryValue = toSignal(
      this.library.valueChanges.pipe(takeUntilDestroyed()),
    );

    // effect to update form when shelfmark changes
    effect(() => {
      this.updateForm(this.shelfmark());
    });

    // effect to handle city control state and extraction based on cityFromLibPattern
    effect(() => {
      const shouldExtract = this.shouldExtractCity();

      // handle city control state
      if (shouldExtract) {
        this.city.disable();

        // extract city from current library value if available
        const value = this.library.value;
        if (value) {
          this.extractAndSetCity(value);
        }
      } else {
        this.city.enable();
      }
    });

    // effect to extract city from library when library value changes
    effect(() => {
      const value = libraryValue();
      if (this.shouldExtractCity() && value) {
        this.extractAndSetCity(value);
      }
    });
  }

  private updateForm(model: CodShelfmark | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.tag.setValue(model.tag || null);
    this.city.setValue(model.city || null);
    this.library.setValue(model.library || null);
    this.fund.setValue(model.fund || null);
    this.location.setValue(model.location || null);
    this.form.markAsPristine();
  }

  /**
   * Extract city from library name using the cityFromLibPattern.
   * @param libraryId The library ID to look up in libEntries.
   */
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
        this.city.setValue(match[1].trim(), { emitEvent: false });
      } else {
        // clear city if no match found
        this.city.setValue(null, { emitEvent: false });
      }
    } catch (error) {
      console.error('Invalid cityFromLibPattern regex:', error);
      console.error('Pattern:', pattern);
      console.error('Library value:', entry.value);
    }
  }

  private getModel(): CodShelfmark {
    return {
      tag: this.tag.value?.trim() || undefined,
      // get city value directly from control (even if disabled)
      city: this.city.value?.trim() || undefined,
      library: this.library.value?.trim() || undefined,
      fund: this.fund.value?.trim() || undefined,
      location: this.location.value?.trim() || undefined,
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.shelfmark.set(this.getModel());
  }
}

import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { NoteSet, NoteSetComponent } from '@myrmidon/cadmus-ui-note-set';

import { CodQuireDescription } from '../cod-sheet-labels-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-quire-description',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    FlagSetComponent,
    NoteSetComponent,
  ],
  templateUrl: './cod-quire-description.component.html',
  styleUrl: './cod-quire-description.component.css',
})
export class CodQuireDescriptionComponent {
  public readonly description = model<CodQuireDescription>();
  public readonly descriptionCancel = output();

  public readonly maxQuireNumber = input<number>(0);

  public readonly scopes = computed(() => {
    const max = this.maxQuireNumber();
    const numbers = max > 0 ? Array.from({ length: max }, (_, i) => i + 1) : [];
    // update note set definitions
    const set = this.scopedNotes.value;
    if (set) {
      set.merge = true;
      set.definitions = numbers.map((n) => ({
        key: `${n}`,
        label: `${n}`,
        maxLength: 1000,
      }));
    }
    return numbers;
  });

  // cod-quire-features
  public readonly featureEntries = input<ThesaurusEntry[]>();

  // flags mapped from thesaurus entries
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || []
  );

  // form
  public features: FormControl<string[]>;
  public note: FormControl<string | null>;
  public scopedNotes: FormControl<NoteSet>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.features = formBuilder.control<string[]>([], { nonNullable: true });
    this.note = formBuilder.control<string | null>(
      null,
      Validators.maxLength(1000)
    );
    this.scopedNotes = formBuilder.control<NoteSet>(
      {
        definitions: [],
      } as NoteSet,
      { nonNullable: true }
    );
    this.form = formBuilder.group({
      features: this.features,
      note: this.note,
      scopedNotes: this.scopedNotes,
    });

    // when model changes, update form
    effect(() => {
      this.updateForm(this.description());
    });
  }

  private getNoteSetFromScoped(scopedNotes?: {
    [key: number]: string;
  }): NoteSet {
    const set: NoteSet = {
      definitions: this.scopes().map((n) => {
        return {
          key: `${n}`,
          label: `${n}`,
          maxLength: 1000,
        };
      }),
      notes: {},
    };
    for (const [key, value] of Object.entries(scopedNotes || {})) {
      set.notes![key] = value;
    }
    return set;
  }

  private getScopedFromNoteSet(
    noteSet?: NoteSet | null
  ): { [key: number]: string } | undefined {
    if (!noteSet) {
      return undefined;
    }
    const scopedNotes: { [key: number]: string } = {};

    // for each key/value pair in the note set, add to scoped notes
    let n = 0;
    for (const [key, value] of Object.entries(noteSet.notes || {})) {
      if (value) {
        const k = parseInt(key, 10);
        scopedNotes[k] = value;
        n++;
      }
    }

    return n ? scopedNotes : undefined;
  }

  private updateForm(model: CodQuireDescription | undefined | null): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.features.setValue(model.features || []);
    this.note.setValue(model.note || null);
    this.scopedNotes.setValue(this.getNoteSetFromScoped(model.scopedNotes));

    this.form.markAsPristine();
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public onSetChange(set: NoteSet): void {
    this.scopedNotes.setValue(set);
    this.scopedNotes.markAsDirty();
    this.scopedNotes.updateValueAndValidity();
  }

  private getQuire(): CodQuireDescription {
    return {
      features: this.features.value?.length ? this.features.value : undefined,
      note: this.note.value || undefined,
      scopedNotes: this.getScopedFromNoteSet(this.scopedNotes.value),
    };
  }

  public cancel(): void {
    this.descriptionCancel.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.description.set(this.getQuire());
  }
}

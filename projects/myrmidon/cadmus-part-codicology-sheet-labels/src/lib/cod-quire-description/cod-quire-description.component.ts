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
    return max > 0 ? Array.from({ length: max }, (_, i) => i + 1) : [];
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
  public scopedNotes: FormControl<{ [key: number]: string }>;
  public form: FormGroup;
  // scoped note
  public scopedNote: FormControl<string | null>;
  public scope: FormControl<number>;
  public scopedNoteForm: FormGroup;

  public setScopes: number[] = [];

  constructor(formBuilder: FormBuilder) {
    // form
    this.features = formBuilder.control<string[]>([], { nonNullable: true });
    this.note = formBuilder.control<string | null>(
      null,
      Validators.maxLength(1000)
    );
    this.scopedNotes = formBuilder.control<{ [key: number]: string }>(
      {},
      { nonNullable: true }
    );
    this.form = formBuilder.group({
      features: this.features,
      note: this.note,
      scopedNotes: this.scopedNotes,
    });

    // scoped note
    this.scopedNote = formBuilder.control<string | null>(
      null,
      Validators.maxLength(1000)
    );
    this.scope = formBuilder.control<number>(0, { nonNullable: true });
    this.scopedNoteForm = formBuilder.group({
      scope: this.scope,
      note: this.scopedNote,
    });

    // when model changes, update form
    effect(() => {
      this.updateForm(this.description());
    });
  }

  private updateSetScopes(): void {
    this.setScopes = Object.keys(this.scopedNotes.value).map((k) => +k).sort();
  }

  private updateForm(model: CodQuireDescription | undefined | null): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.features.setValue(model.features || []);
    this.note.setValue(model.note || null);
    this.scopedNotes.setValue(model.scopedNotes || {});
    this.updateSetScopes();

    this.form.markAsPristine();
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  private getQuire(): CodQuireDescription {
    return {
      features: this.features.value?.length ? this.features.value : undefined,
      note: this.note.value || undefined,
      scopedNotes:
        this.scopedNotes.value && Object.keys(this.scopedNotes.value).length > 0
          ? this.scopedNotes.value
          : undefined,
    };
  }

  public saveScopedNote(): void {
    if (this.scopedNoteForm.invalid) {
      return;
    }
    const scope = this.scope.value;
    const note = this.scopedNote.value || null;
    const notes = this.scopedNotes.value;
    if (note) {
      notes[scope] = note;
    } else {
      delete notes[scope];
    }
    this.scopedNotes.setValue(notes);
    this.scopedNotes.markAsDirty();
    this.scopedNotes.updateValueAndValidity();
    this.updateSetScopes();
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

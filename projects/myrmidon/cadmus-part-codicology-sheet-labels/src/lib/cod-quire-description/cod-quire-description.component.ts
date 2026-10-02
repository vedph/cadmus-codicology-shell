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
import { form, FormField, maxLength } from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { NoteSet, NoteSetComponent } from '@myrmidon/cadmus-ui-note-set';

import { CodQuireDescription } from '../cod-sheet-labels-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface CodQuireDescriptionControls {
  features: string[];
  note: string;
  scopedNotes: NoteSet;
}

/**
 * Get a note set with a note for each quire number in scopes, from the
 * scoped notes of a quire description.
 */
function getNoteSetFromScoped(
  scopes: number[],
  scopedNotes?: { [key: number]: string },
): NoteSet {
  const set: NoteSet = {
    definitions: scopes.map((n) => {
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

function toDraft(
  scopes: number[],
  model?: CodQuireDescription,
): CodQuireDescriptionControls {
  return {
    features: [...(model?.features || [])],
    note: model?.note || '',
    scopedNotes: getNoteSetFromScoped(scopes, model?.scopedNotes),
  };
}

@Component({
  selector: 'cadmus-cod-quire-description',
  imports: [
    FormField,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodQuireDescriptionComponent {
  public readonly description = model<CodQuireDescription>();

  private readonly _draft = linkedSignal(() =>
    toDraft(this.scopes(), this.description()),
  );

  // the note set for the bound description: it is built from the bound
  // description only, as the note set component resets on a new object
  public readonly initialNoteSet = computed<NoteSet>(() =>
    getNoteSetFromScoped(this.scopes(), this.description()?.scopedNotes),
  );
  public readonly form = form(this._draft, (p) => {
    maxLength(p.note, 1000);
  });
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
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || [],
  );

  // form

  constructor() {
    // new description: clear the interaction state
    effect(() => {
      this.description();
      untracked(() => this.form().reset());
    });
  }

  private getScopedFromNoteSet(
    noteSet?: NoteSet | null,
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

  public onFeatureCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...(ids || [])]);
  }

  public onSetChange(set: NoteSet): void {
    setFieldFromChild(this.form.scopedNotes, copyFormValue(set));
  }

  private getQuire(): CodQuireDescription {
    const draft = this._draft();
    return {
      features: draft.features.length ? [...draft.features] : undefined,
      note: draft.note || undefined,
      scopedNotes: this.getScopedFromNoteSet(draft.scopedNotes),
    };
  }

  public cancel(): void {
    this.descriptionCancel.emit();
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
    this.description.set(this.getQuire());
  }
}

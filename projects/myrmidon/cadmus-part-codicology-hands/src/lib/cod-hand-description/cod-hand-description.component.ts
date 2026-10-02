import { KeyValue } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { form, FormField, maxLength } from '@angular/forms/signals';
import { take } from 'rxjs';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  NoteSet,
  NoteSetDefinition,
  NoteSetComponent,
} from '@myrmidon/cadmus-ui-note-set';
import { CodLocationPipe } from '@myrmidon/cadmus-cod-location';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { CodHandDescription, CodHandSign } from '../cod-hands-part';
import { CodHandSignComponent } from '../cod-hand-sign/cod-hand-sign.component';

// the definitions of the notes edited in the note set
const NOTE_DEFS: NoteSetDefinition[] = [
  {
    key: 'i',
    label: 'initials',
    maxLength: 500,
  },
  {
    key: 'c',
    label: 'corrections',
    maxLength: 500,
  },
  {
    key: 'p',
    label: 'punctuation',
    maxLength: 500,
  },
  {
    key: 'a',
    label: 'abbreviations',
    markdown: true,
    maxLength: 1000,
  },
  {
    key: 'n',
    label: 'note',
    maxLength: 1000,
  },
];

interface CodHandDescriptionControls {
  key: string;
  dsc: string;
  initials: string;
  corrections: string;
  punctuation: string;
  abbreviations: string;
  note: string;
  signs: CodHandSign[];
}

function toDraft(model?: CodHandDescription): CodHandDescriptionControls {
  return {
    key: model?.key || '',
    dsc: model?.description || '',
    initials: model?.initials || '',
    corrections: model?.corrections || '',
    punctuation: model?.punctuation || '',
    abbreviations: model?.abbreviations || '',
    note: model?.note || '',
    signs: copyFormValue(model?.signs || []),
  };
}

@Component({
  selector: 'cadmus-cod-hand-description',
  templateUrl: './cod-hand-description.component.html',
  styleUrls: ['./cod-hand-description.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    NoteSetComponent,
    MatButton,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    CodHandSignComponent,
    CodLocationPipe,
  ],
})
export class CodHandDescriptionComponent {
  private readonly _dialogService = inject(DialogService);

  public readonly description = model<CodHandDescription>();

  private readonly _draft = linkedSignal(() => toDraft(this.description()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.key, 100);
    maxLength(p.dsc, 1000);
    maxLength(p.note, 1000);
  });

  // cod-hand-sign-types
  public readonly sgnTypeEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  // the note set for the bound description: it is built from the bound
  // description only, as the note set component resets on a new object
  public readonly initialNoteSet = computed<NoteSet>(() => {
    const model = this.description();
    const notes: { [key: string]: string } = {};
    if (model?.initials) {
      notes['i'] = model.initials;
    }
    if (model?.corrections) {
      notes['c'] = model.corrections;
    }
    if (model?.punctuation) {
      notes['p'] = model.punctuation;
    }
    if (model?.abbreviations) {
      notes['a'] = model.abbreviations;
    }
    if (model?.note) {
      notes['n'] = model.note;
    }
    return model ? { definitions: NOTE_DEFS, notes } : { definitions: NOTE_DEFS };
  });
  public readonly editedSign = signal<CodHandSign | undefined>(undefined);
  public readonly editedSignIndex = signal(-1);

  constructor() {
    // new description: clear the interaction state
    effect(() => {
      this.description();
      untracked(() => this.form().reset());
    });
  }

  private getDescription(): CodHandDescription {
    const draft = this._draft();
    return {
      key: draft.key.trim() || undefined,
      description: draft.dsc.trim() || undefined,
      initials: draft.initials.trim() || undefined,
      corrections: draft.corrections.trim() || undefined,
      punctuation: draft.punctuation.trim() || undefined,
      abbreviations: draft.abbreviations.trim() || undefined,
      note: draft.note.trim() || undefined,
      signs: draft.signs.length ? copyFormValue(draft.signs) : undefined,
    };
  }

  public onNoteChange(pair: KeyValue<string, string | null>): void {
    const value = pair.value || '';
    switch (pair.key) {
      case 'i':
        setFieldFromChild(this.form.initials, value);
        break;
      case 'c':
        setFieldFromChild(this.form.corrections, value);
        break;
      case 'p':
        setFieldFromChild(this.form.punctuation, value);
        break;
      case 'a':
        setFieldFromChild(this.form.abbreviations, value);
        break;
      case 'n':
        setFieldFromChild(this.form.note, value);
        break;
    }
  }

  //#region signs
  public addSign(): void {
    this.editSign({
      type: this.sgnTypeEntries()?.length ? this.sgnTypeEntries()![0].id : '',
      sampleLocation: { n: 0 },
    });
  }

  public editSign(sign: CodHandSign | null, index = -1): void {
    if (!sign) {
      this.editedSignIndex.set(-1);
      this.editedSign.set(undefined);
    } else {
      this.editedSignIndex.set(index);
      this.editedSign.set(structuredClone(sign));
    }
  }

  public onSignChange(sign: CodHandSign): void {
    const signs = [...this.form.signs().value()];
    if (this.editedSignIndex() > -1) {
      signs.splice(this.editedSignIndex(), 1, sign);
    } else {
      signs.push(sign);
    }
    this.form.signs().value.set(signs);
    this.form.signs().markAsDirty();
    this.editSign(null);
  }

  public deleteSign(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete sign?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const signs = [...this.form.signs().value()];
          signs.splice(index, 1);
          this.form.signs().value.set(signs);
          this.form.signs().markAsDirty();
        }
      });
  }

  public moveSignUp(index: number): void {
    if (index < 1) {
      return;
    }
    const sign = this.form.signs().value()[index];
    const signs = [...this.form.signs().value()];
    signs.splice(index, 1);
    signs.splice(index - 1, 0, sign);
    this.form.signs().value.set(signs);
    this.form.signs().markAsDirty();
  }

  public moveSignDown(index: number): void {
    if (index + 1 >= this.form.signs().value().length) {
      return;
    }
    const sign = this.form.signs().value()[index];
    const signs = [...this.form.signs().value()];
    signs.splice(index, 1);
    signs.splice(index + 1, 0, sign);
    this.form.signs().value.set(signs);
    this.form.signs().markAsDirty();
  }
  //#endregion

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
    this.description.set(this.getDescription());
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NoteSetDefinition } from '@myrmidon/cadmus-codicology-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodHandDescription } from '../cod-hands-part';

@Component({
  selector: 'cadmus-cod-hand-description',
  templateUrl: './cod-hand-description.component.html',
  styleUrls: ['./cod-hand-description.component.css'],
})
export class CodHandDescriptionComponent implements OnInit {
  private _model: CodHandDescription | undefined;
  private _noteEntries: ThesaurusEntry[] | undefined;

  @Input()
  public get model(): CodHandDescription | undefined {
    return this._model;
  }
  public set model(value: CodHandDescription | undefined) {
    this._model = value;
    this.updateForm(value);
  }

  @Input()
  public get noteEntries(): ThesaurusEntry[] | undefined {
    return this._noteEntries;
  }
  public set noteEntries(value: ThesaurusEntry[] | undefined) {
    this._noteEntries = value;
    this.updateNoteSetDefs();
  }

  @Output()
  public modelChange: EventEmitter<CodHandDescription>;
  @Output()
  public editorClose: EventEmitter<any>;

  public key: FormControl;
  public description: FormControl;
  // TODO
  public signs: FormControl;
  public form: FormGroup;

  public noteSetDefs: NoteSetDefinition[];

  constructor(formBuilder: FormBuilder) {
    this.modelChange = new EventEmitter<CodHandDescription>();
    this.editorClose = new EventEmitter<any>();
    this.noteSetDefs = [];
    // form
    this.key = formBuilder.control(null, Validators.maxLength(100));
    this.description = formBuilder.control(null, Validators.maxLength(1000));
    this.signs = formBuilder.control([]);
    // TODO: controls
    this.form = formBuilder.group({
      key: this.key,
      description: this.description,
      signs: this.signs,
      // TODO
    });
  }

  ngOnInit(): void {
    if (this._model) {
      this.updateForm(this._model);
    }
  }

  private parseNoteDefEntry(entry: ThesaurusEntry): {
    label: string;
    maxLength: number;
    markdown: boolean;
  } {
    // value: label|LEN*
    let text = entry.value;
    let md = false;
    if (text.endsWith('*')) {
      md = true;
      text = text.substring(0, text.length - 1);
    }

    const i = text.lastIndexOf('|');
    return i > -1
      ? {
          label: text.substring(0, i),
          maxLength: +text.substring(i + 1),
          markdown: md,
        }
      : {
          label: text,
          maxLength: 500,
          markdown: md,
        };
  }

  private updateNoteSetDefs(): void {
    const defs: NoteSetDefinition[] = [
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
    ];
    if (this._noteEntries?.length) {
      let entry = this._noteEntries.find((e) => e.id === 'initials');
      if (entry) {
        Object.assign(defs[0], this.parseNoteDefEntry(entry));
      }
      entry = this._noteEntries.find((e) => e.id === 'corrections');
      if (entry) {
        Object.assign(defs[1], this.parseNoteDefEntry(entry));
      }
      entry = this._noteEntries.find((e) => e.id === 'punctuation');
      if (entry) {
        Object.assign(defs[2], this.parseNoteDefEntry(entry));
      }
      entry = this._noteEntries.find((e) => e.id === 'abbreviations');
      if (entry) {
        Object.assign(defs[3], this.parseNoteDefEntry(entry));
      }
    }
    this.noteSetDefs = defs;
  }

  private updateForm(model: CodHandDescription | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    // TODO set controls values

    this.form.markAsPristine();
  }

  private getModel(): CodHandDescription | null {
    return {
      // TODO get values from controls
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    const model = this.getModel();
    if (!model) {
      return;
    }
    this.modelChange.emit(model);
  }
}

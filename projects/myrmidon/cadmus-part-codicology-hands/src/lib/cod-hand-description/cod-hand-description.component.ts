import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NoteSet, NoteSetDefinition } from '@myrmidon/cadmus-codicology-ui';

import { CodHandDescription } from '../cod-hands-part';

@Component({
  selector: 'cadmus-cod-hand-description',
  templateUrl: './cod-hand-description.component.html',
  styleUrls: ['./cod-hand-description.component.css'],
})
export class CodHandDescriptionComponent implements OnInit {
  private _model: CodHandDescription | undefined;
  private _noteDefs: NoteSetDefinition[];

  @Input()
  public get model(): CodHandDescription | undefined {
    return this._model;
  }
  public set model(value: CodHandDescription | undefined) {
    this._model = value;
    this.updateForm(value);
  }

  @Output()
  public modelChange: EventEmitter<CodHandDescription>;
  @Output()
  public editorClose: EventEmitter<any>;

  public key: FormControl;
  public description: FormControl;
  public initials: FormControl;
  public corrections: FormControl;
  public punctuation: FormControl;
  public abbreviations: FormControl;
  public signs: FormControl;
  public form: FormGroup;

  public initialNoteSet?: NoteSet;

  constructor(formBuilder: FormBuilder) {
    this._noteDefs = [
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
    this.modelChange = new EventEmitter<CodHandDescription>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.key = formBuilder.control(null, Validators.maxLength(100));
    this.description = formBuilder.control(null, Validators.maxLength(1000));
    this.initials = formBuilder.control(null);
    this.corrections = formBuilder.control(null);
    this.punctuation = formBuilder.control(null);
    this.abbreviations = formBuilder.control(null);
    this.signs = formBuilder.control([]);
    this.form = formBuilder.group({
      key: this.key,
      description: this.description,
      initials: this.initials,
      corrections: this.corrections,
      punctuation: this.punctuation,
      abbreviations: this.abbreviations,
      signs: this.signs,
    });
  }

  ngOnInit(): void {
    if (this._model) {
      this.updateForm(this._model);
    }
  }

  private updateForm(model: CodHandDescription | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.key.setValue(model.key);
    this.description.setValue(model.description);

    const map = new Map<string, string | null>();
    this.initials.setValue(model.initials);
    this.corrections.setValue(model.corrections);
    this.punctuation.setValue(model.punctuation);
    this.abbreviations.setValue(model.abbreviations);
    if (model.initials) {
      map.set('initials', model.initials);
    }
    if (model.corrections) {
      map.set('corrections', model.corrections);
    }
    if (model.punctuation) {
      map.set('punctuation', model.punctuation);
    }
    if (model.abbreviations) {
      map.set('abbreviations', model.abbreviations);
    }
    this.initialNoteSet = {
      definitions: this._noteDefs,
      notes: map,
    };

    this.signs.setValue(model.signs || []);

    this.form.markAsPristine();
  }

  private getModel(): CodHandDescription | null {
    return {
      key: this.key.value?.trim(),
      description: this.description.value?.trim(),
      // TODO
      signs: this.signs.value?.length? this.signs.value : undefined
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

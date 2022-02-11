import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NoteSet, NoteSetDefinition } from '@myrmidon/cadmus-codicology-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { take } from 'rxjs';

import { CodHandDescription, CodHandSign } from '../cod-hands-part';

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

  // cod-hand-sign-types
  @Input()
  public sgnTypeEntries: ThesaurusEntry[] | undefined;

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
  public editedSign?: CodHandSign;
  public editedSignIndex;

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    this.editedSignIndex = -1;
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
      map.set('i', model.initials);
    }
    if (model.corrections) {
      map.set('c', model.corrections);
    }
    if (model.punctuation) {
      map.set('p', model.punctuation);
    }
    if (model.abbreviations) {
      map.set('a', model.abbreviations);
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
      initials: this.initials.value?.trim(),
      corrections: this.corrections.value?.trim(),
      punctuation: this.punctuation.value?.trim(),
      abbreviations: this.abbreviations.value?.trim(),
      signs: this.signs.value?.length ? this.signs.value : undefined,
    };
  }

  public onNoteChange(pair: KeyValue<string, string | null>) {
    switch (pair.key) {
      case 'i':
        this.initials.setValue(pair.value);
        this.initials.markAsDirty();
        break;
      case 'c':
        this.corrections.setValue(pair.value);
        this.corrections.markAsDirty();
        break;
      case 'p':
        this.punctuation.setValue(pair.value);
        this.punctuation.markAsDirty();
        break;
      case 'a':
        this.abbreviations.setValue(pair.value);
        this.abbreviations.markAsDirty();
        break;
    }
  }

  //#region signs
  public addSign(): void {
    const sign: CodHandSign = {
      type: this.sgnTypeEntries?.length ? this.sgnTypeEntries[0].id : '',
      sampleLocation: { n: 0 },
    };
    this.signs.setValue([...this.signs.value, sign]);
    this.signs.markAsDirty();
    this.editSign(this.signs.value.length - 1);
  }

  public editSign(index: number): void {
    if (index < 0) {
      this.editedSignIndex = -1;
      this.editedSign = undefined;
    } else {
      this.editedSignIndex = index;
      this.editedSign = this.signs.value[index];
    }
  }

  public onSignSave(sign: CodHandSign): void {
    this.signs.setValue(
      this.signs.value.map((x: CodHandSign, i: number) =>
        i === this.editedSignIndex ? sign : x
      )
    );
    this.signs.markAsDirty();
    this.editSign(-1);
  }

  public onSignClose(): void {
    this.editSign(-1);
  }

  public deleteSign(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete sign?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const signs = [...this.signs.value];
          signs.splice(index, 1);
          this.signs.setValue(signs);
          this.signs.markAsDirty();
        }
      });
  }

  public moveSignUp(index: number): void {
    if (index < 1) {
      return;
    }
    const sign = this.signs.value[index];
    const signs = [...this.signs.value];
    signs.splice(index, 1);
    signs.splice(index - 1, 0, sign);
    this.signs.setValue(signs);
    this.signs.markAsDirty();
  }

  public moveSignDown(index: number): void {
    if (index + 1 >= this.signs.value.length) {
      return;
    }
    const sign = this.signs.value[index];
    const signs = [...this.signs.value];
    signs.splice(index, 1);
    signs.splice(index + 1, 0, sign);
    this.signs.setValue(signs);
    this.signs.markAsDirty();
  }
  //#endregion

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

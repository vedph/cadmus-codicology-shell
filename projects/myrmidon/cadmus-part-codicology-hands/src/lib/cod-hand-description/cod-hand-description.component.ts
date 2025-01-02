import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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

import { CodHandDescription, CodHandSign } from '../cod-hands-part';
import { CodHandSignComponent } from '../cod-hand-sign/cod-hand-sign.component';

@Component({
  selector: 'cadmus-cod-hand-description',
  templateUrl: './cod-hand-description.component.html',
  styleUrls: ['./cod-hand-description.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
export class CodHandDescriptionComponent implements OnInit {
  private _description: CodHandDescription | undefined;
  private _noteDefs: NoteSetDefinition[];

  @Input()
  public get description(): CodHandDescription | undefined {
    return this._description;
  }
  public set description(value: CodHandDescription | undefined) {
    if (this._description === value) {
      return;
    }
    this._description = value;
    this.updateForm(value);
  }

  // cod-hand-sign-types
  @Input()
  public sgnTypeEntries: ThesaurusEntry[] | undefined;

  @Output()
  public descriptionChange: EventEmitter<CodHandDescription>;
  @Output()
  public editorClose: EventEmitter<any>;

  public key: FormControl<string | null>;
  public dsc: FormControl<string | null>;
  public initials: FormControl<string | null>;
  public corrections: FormControl<string | null>;
  public punctuation: FormControl<string | null>;
  public abbreviations: FormControl<string | null>;
  public signs: FormControl<CodHandSign[]>;
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
    this.descriptionChange = new EventEmitter<CodHandDescription>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.key = formBuilder.control(null, Validators.maxLength(100));
    this.dsc = formBuilder.control(null, Validators.maxLength(1000));
    this.initials = formBuilder.control(null);
    this.corrections = formBuilder.control(null);
    this.punctuation = formBuilder.control(null);
    this.abbreviations = formBuilder.control(null);
    this.signs = formBuilder.control([], { nonNullable: true });
    this.form = formBuilder.group({
      key: this.key,
      description: this.dsc,
      initials: this.initials,
      corrections: this.corrections,
      punctuation: this.punctuation,
      abbreviations: this.abbreviations,
      signs: this.signs,
    });
  }

  ngOnInit(): void {
    if (this._description) {
      this.updateForm(this._description);
    }
  }

  private updateForm(model: CodHandDescription | undefined): void {
    if (!model) {
      this.form.reset();
      this.initialNoteSet = {
        definitions: this._noteDefs,
      };
      return;
    }

    this.key.setValue(model.key || null);
    this.dsc.setValue(model.description || null);

    const map = new Map<string, string | null>();
    this.initials.setValue(model.initials || null);
    this.corrections.setValue(model.corrections || null);
    this.punctuation.setValue(model.punctuation || null);
    this.abbreviations.setValue(model.abbreviations || null);
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

  private getModel(): CodHandDescription {
    return {
      key: this.key.value?.trim(),
      description: this.dsc.value?.trim(),
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
        this.initials.updateValueAndValidity();
        this.initials.markAsDirty();
        break;
      case 'c':
        this.corrections.setValue(pair.value);
        this.corrections.updateValueAndValidity();
        this.corrections.markAsDirty();
        break;
      case 'p':
        this.punctuation.setValue(pair.value);
        this.punctuation.updateValueAndValidity();
        this.punctuation.markAsDirty();
        break;
      case 'a':
        this.abbreviations.setValue(pair.value);
        this.abbreviations.updateValueAndValidity();
        this.abbreviations.markAsDirty();
        break;
    }
  }

  //#region signs
  public addSign(): void {
    this.editSign({
      type: this.sgnTypeEntries?.length ? this.sgnTypeEntries[0].id : '',
      sampleLocation: { n: 0 },
    });
  }

  public editSign(sign: CodHandSign | null, index = -1): void {
    if (!sign) {
      this.editedSignIndex = -1;
      this.editedSign = undefined;
    } else {
      this.editedSignIndex = index;
      this.editedSign = sign;
    }
  }

  public onSignSave(sign: CodHandSign): void {
    const signs = [...this.signs.value];
    if (this.editedSignIndex > -1) {
      signs.splice(this.editedSignIndex, 1, sign);
    } else {
      signs.push(sign);
    }
    this.signs.setValue(signs);
    this.signs.updateValueAndValidity();
    this.signs.markAsDirty();
    this.editSign(null);
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
          this.signs.updateValueAndValidity();
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
    this.signs.updateValueAndValidity();
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
    this.signs.updateValueAndValidity();
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
    this._description = this.getModel();
    this.descriptionChange.emit(this._description);
  }
}

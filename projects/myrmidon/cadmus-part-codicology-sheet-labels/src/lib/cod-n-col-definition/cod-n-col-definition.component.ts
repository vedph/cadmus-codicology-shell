import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  HistoricalDateModel,
  HistoricalDateComponent,
} from '@myrmidon/cadmus-refs-historical-date';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodNColDefinition } from '../cod-sheet-labels-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-n-col-definition',
  templateUrl: './cod-n-col-definition.component.html',
  styleUrls: ['./cod-n-col-definition.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatCheckbox,
    MatSelect,
    MatOption,
    MatError,
    FlagSetComponent,
    HistoricalDateComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodNColDefinitionComponent {
  private _definition: CodNColDefinition | undefined;
  private _clrEntries: ThesaurusEntry[] | undefined;

  @Input()
  public get definition(): CodNColDefinition | undefined {
    return this._definition;
  }
  public set definition(value: CodNColDefinition | undefined) {
    if (this._definition === value) {
      return;
    }
    this._definition = value;
    this.updateForm(value);
  }

  // cod-numbering-systems
  @Input()
  public sysEntries: ThesaurusEntry[] | undefined;
  // cod-numbering-techniques
  @Input()
  public techEntries: ThesaurusEntry[] | undefined;
  // cod-numbering-positions
  @Input()
  public posEntries: ThesaurusEntry[] | undefined;

  // cod-numbering-colors
  @Input()
  public get clrEntries(): ThesaurusEntry[] | undefined {
    return this._clrEntries;
  }
  public set clrEntries(value: ThesaurusEntry[] | undefined) {
    if (this._clrEntries === value) {
      return;
    }
    this._clrEntries = value || [];
    this.colorFlags = this._clrEntries.map(entryToFlag);
  }

  @Output()
  public definitionChange: EventEmitter<CodNColDefinition>;
  @Output()
  public editorClose: EventEmitter<any>;

  public id: string;
  public rank: FormControl<number>;
  public isPagination: FormControl<boolean>;
  public isByScribe: FormControl<boolean>;
  public system: FormControl<string | null>;
  public technique: FormControl<string | null>;
  public position: FormControl<string | null>;
  public colors: FormControl<string[]>;
  public hasDate: FormControl<boolean>;
  public date: FormControl<HistoricalDateModel | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  // flags
  public colorFlags: Flag[] = [];

  constructor(formBuilder: FormBuilder) {
    this.definitionChange = new EventEmitter<CodNColDefinition>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.id = '';
    this.rank = formBuilder.control(0, { nonNullable: true });
    this.isPagination = formBuilder.control(false, { nonNullable: true });
    this.isByScribe = formBuilder.control(false, { nonNullable: true });
    this.system = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.technique = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.position = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.colors = formBuilder.control([], { nonNullable: true });
    this.hasDate = formBuilder.control(false, { nonNullable: true });
    this.date = formBuilder.control(null);
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      rank: this.rank,
      isPagination: this.isPagination,
      isByScribe: this.isByScribe,
      system: this.system,
      technique: this.technique,
      position: this.position,
      colors: this.colors,
      hasDate: this.hasDate,
      date: this.date,
      note: this.note,
    });
  }

  private updateForm(model: CodNColDefinition | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.id = model.id;
    this.rank.setValue(model.rank || 0);
    this.isPagination.setValue(model.isPagination || false);
    this.isByScribe.setValue(model.isByScribe || false);
    this.system.setValue(model.system);
    this.technique.setValue(model.technique);
    this.position.setValue(model.position);
    this.colors.setValue(model.colors || []);
    this.hasDate.setValue(model.date ? true : false);
    this.date.setValue(model.date || null);
    this.note.setValue(model.note || null);
    this.form.markAsPristine();
  }

  private getModel(): CodNColDefinition {
    return {
      id: this.id,
      rank: +this.rank.value || 0,
      isPagination: this.isPagination.value ? true : undefined,
      isByScribe: this.isByScribe.value ? true : undefined,
      system: this.system.value?.trim() || '',
      technique: this.technique.value?.trim() || '',
      position: this.position.value?.trim() || '',
      colors: this.colors.value?.length ? this.colors.value : undefined,
      date: this.hasDate.value ? this.date.value || undefined : undefined,
      note: this.note.value?.trim(),
    };
  }

  public onColorIdsChange(ids: string[]): void {
    this.colors.setValue(ids);
    this.colors.updateValueAndValidity();
    this.colors.markAsDirty();
  }

  public onDateChange(date: HistoricalDateModel): void {
    this.date.setValue(date);
    this.date.updateValueAndValidity();
    this.date.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._definition = this.getModel();
    this.definitionChange.emit(this._definition);
  }
}

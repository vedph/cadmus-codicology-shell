import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { HistoricalDateModel } from '@myrmidon/cadmus-refs-historical-date';
import { Flag } from '@myrmidon/cadmus-ui-flags-picker';

import { CodNColDefinition } from '../cod-sheet-labels-part';

@Component({
  selector: 'cadmus-cod-n-col-definition',
  templateUrl: './cod-n-col-definition.component.html',
  styleUrls: ['./cod-n-col-definition.component.css'],
})
export class CodNColDefinitionComponent implements OnInit {
  private _definition: CodNColDefinition | undefined;
  private _clrEntries: ThesaurusEntry[] | undefined;

  @Input()
  public get definition(): CodNColDefinition | undefined {
    return this._definition;
  }
  public set definition(value: CodNColDefinition | undefined) {
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
    this._clrEntries = value;
    this.clrFlags = value?.length
      ? value.map((e) => {
          return {
            id: e.id,
            label: e.value,
          } as Flag;
        })
      : [];
  }

  @Output()
  public definitionChange: EventEmitter<CodNColDefinition>;
  @Output()
  public editorClose: EventEmitter<any>;

  public id: FormControl;
  public rank: FormControl;
  public isPagination: FormControl;
  public system: FormControl;
  public technique: FormControl;
  public position: FormControl;
  public colors: FormControl;
  public hasDate: FormControl;
  public date: FormControl;
  public note: FormControl;
  public form: FormGroup;

  public initialColors: string[];
  public initialDate?: HistoricalDateModel;
  public clrFlags: Flag[];

  constructor(formBuilder: FormBuilder) {
    this.definitionChange = new EventEmitter<CodNColDefinition>();
    this.editorClose = new EventEmitter<any>();
    this.initialColors = [];
    this.clrFlags = [];
    // form
    this.id = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.rank = formBuilder.control(0);
    this.isPagination = formBuilder.control(false);
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
    this.colors = formBuilder.control([]);
    this.hasDate = formBuilder.control(false);
    this.date = formBuilder.control(null);
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      id: this.id,
      rank: this.rank,
      isPagination: this.isPagination,
      system: this.system,
      technique: this.technique,
      position: this.position,
      colors: this.colors,
      hasDate: this.hasDate,
      date: this.date,
      note: this.note,
    });
  }

  ngOnInit(): void {
    if (this._definition) {
      this.updateForm(this._definition);
    }
  }

  private updateForm(model: CodNColDefinition | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.id.setValue(model.id);
    this.rank.setValue(model.rank);
    this.isPagination.setValue(model.isPagination);
    this.system.setValue(model.system);
    this.technique.setValue(model.technique);
    this.position.setValue(model.position);
    this.initialColors = model.colors || [];
    this.hasDate.setValue(model.date ? true : false);
    this.initialDate = model.date;
    this.note.setValue(model.note);

    this.form.markAsPristine();
  }

  private getModel(): CodNColDefinition {
    return {
      id: this.id.value?.trim(),
      rank: this.rank.value || 0,
      isPagination: this.isPagination.value ? true : false,
      system: this.system.value?.trim(),
      technique: this.technique.value?.trim(),
      position: this.position.value?.trim(),
      colors: this.colors.value?.length ? this.colors.value : undefined,
      date: this.hasDate.value ? this.date.value : undefined,
      note: this.note.value?.trim(),
    };
  }

  public onSelectedIdsChange(ids: string[]): void {
    this.colors.setValue(ids);
  }

  public onDateChange(date: HistoricalDateModel): void {
    this.date.setValue(date);
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.definitionChange.emit(this.getModel());
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { NgToolsValidators } from '@myrmidon/ng-tools';

import { CodUnit } from '../cod-material-dsc-part';

@Component({
  selector: 'cadmus-cod-unit-editor',
  templateUrl: './cod-unit-editor.component.html',
  styleUrls: ['./cod-unit-editor.component.css'],
})
export class CodUnitEditorComponent implements OnInit {
  private _unit: CodUnit | undefined;

  @Input()
  public get unit(): CodUnit | undefined {
    return this._unit;
  }
  public set unit(value: CodUnit | undefined) {
    this._unit = value;
    this.updateForm(value);
  }

  @Input()
  public tagEntries: ThesaurusEntry[] | undefined;
  @Input()
  public materialEntries: ThesaurusEntry[] | undefined;
  @Input()
  public formatEntries: ThesaurusEntry[] | undefined;
  @Input()
  public stateEntries: ThesaurusEntry[] | undefined;

  @Output()
  public unitChange: EventEmitter<CodUnit>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl;
  public tag: FormControl;
  public noGregory: FormControl;
  public material: FormControl;
  public format: FormControl;
  public state: FormControl;
  public range: FormControl;
  public chronotopes: FormControl;
  public note: FormControl;
  public form: FormGroup;

  public initialRange?: CodLocationRange;
  public initialChronotopes?: AssertedChronotope[];

  constructor(formBuilder: FormBuilder) {
    this.unitChange = new EventEmitter<CodUnit>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.noGregory = formBuilder.control(false);
    this.material = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.format = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.state = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.range = formBuilder.control(null, Validators.required);
    this.chronotopes = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      eid: this.eid,
      tag: this.tag,
      noGregory: this.noGregory,
      material: this.material,
      format: this.format,
      state: this.state,
      range: this.range,
      chronotopes: this.chronotopes,
      note: this.note,
    });
  }

  ngOnInit(): void {
    if (this._unit) {
      this.updateForm(this._unit);
    }
  }

  private updateForm(unit: CodUnit | undefined): void {
    if (!unit) {
      this.form.reset();
      return;
    }

    this.eid.setValue(unit.eid);
    this.tag.setValue(unit.tag);
    this.material.setValue(unit.material);
    this.format.setValue(unit.format);
    this.state.setValue(unit.state);
    this.initialRange = unit.range;
    this.initialChronotopes = unit.chronotopes;
    this.note.setValue(unit.note);

    this.form.markAsPristine();
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.range.setValue(ranges?.length ? ranges[0] : undefined);
  }

  private getModel(): CodUnit | null {
    return {
      eid: this.eid.value?.trim(),
      tag: this.tag.value?.trim(),
      noGregory: this.noGregory.value ? true : false,
      material: this.material.value?.trim(),
      format: this.format.value?.trim(),
      state: this.state.value?.trim(),
      range: this.range.value,
      chronotopes: this.chronotopes.value?.length
        ? this.chronotopes.value
        : undefined,
      note: this.note.value?.trim(),
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
    this.unitChange.emit(model);
  }
}

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
  standalone: false,
})
export class CodUnitEditorComponent implements OnInit {
  private _unit: CodUnit | undefined;

  @Input()
  public get unit(): CodUnit | undefined {
    return this._unit;
  }
  public set unit(value: CodUnit | undefined) {
    if (this._unit === value) {
      return;
    }
    this._unit = value;
    this.updateForm(value);
  }

  // cod-unit-tags
  @Input()
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-unit-materials
  @Input()
  public materialEntries: ThesaurusEntry[] | undefined;
  // cod-unit-formats
  @Input()
  public formatEntries: ThesaurusEntry[] | undefined;
  // cod-unit-states
  @Input()
  public stateEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  @Input()
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  @Input()
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  @Input()
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  @Input()
  public refTagEntries: ThesaurusEntry[] | undefined;

  @Output()
  public unitChange: EventEmitter<CodUnit>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl<string | null>;
  public tag: FormControl<string | null>;
  public noGregory: FormControl<boolean>;
  public material: FormControl<string | null>;
  public format: FormControl<string | null>;
  public state: FormControl<string | null>;
  public ranges: FormControl<CodLocationRange[]>;
  public chronotopes: FormControl<AssertedChronotope[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.unitChange = new EventEmitter<CodUnit>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.noGregory = formBuilder.control(false, { nonNullable: true });
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
    this.ranges = formBuilder.control([], {
      validators: Validators.required,
      nonNullable: true,
    });
    this.chronotopes = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      eid: this.eid,
      tag: this.tag,
      noGregory: this.noGregory,
      material: this.material,
      format: this.format,
      state: this.state,
      ranges: this.ranges,
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

    this.eid.setValue(unit.eid || null);
    this.tag.setValue(unit.tag || null);
    this.noGregory.setValue(unit.noGregory ? true : false);
    this.material.setValue(unit.material);
    this.format.setValue(unit.format);
    this.state.setValue(unit.state);
    this.ranges.setValue(unit.ranges || []);
    this.chronotopes.setValue(unit.chronotopes || []);
    this.note.setValue(unit.note || null);
    this.form.markAsPristine();
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onChronotopesChange(chronotopes: AssertedChronotope[]): void {
    this.chronotopes.setValue(chronotopes);
    this.chronotopes.updateValueAndValidity();
    this.chronotopes.markAsDirty();
  }

  private getModel(): CodUnit {
    return {
      eid: this.eid.value?.trim(),
      tag: this.tag.value?.trim(),
      noGregory: this.noGregory.value ? true : false,
      material: this.material.value?.trim() || '',
      format: this.format.value?.trim() || '',
      state: this.state.value?.trim() || '',
      ranges: this.ranges.value,
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
    this._unit = this.getModel();
    this.unitChange.emit(this._unit);
  }
}

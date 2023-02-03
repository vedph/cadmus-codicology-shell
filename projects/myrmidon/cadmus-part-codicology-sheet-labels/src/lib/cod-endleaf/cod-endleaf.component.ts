import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';

import { CodEndleaf } from '../cod-sheet-labels-part';

@Component({
  selector: 'cadmus-cod-endleaf',
  templateUrl: './cod-endleaf.component.html',
  styleUrls: ['./cod-endleaf.component.css'],
})
export class CodEndleafComponent implements OnInit {
  private _endleaf: CodEndleaf | undefined;

  @Input()
  public get endleaf(): CodEndleaf | undefined {
    return this._endleaf;
  }
  public set endleaf(value: CodEndleaf | undefined) {
    if (this._endleaf === value) {
      return;
    }
    this._endleaf = value;
    this.updateForm(value);
  }

  // cod-endleaf-materials
  @Input()
  public matEntries: ThesaurusEntry[] | undefined;
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

  @Input()
  public locations: string[];

  @Output()
  public endleafChange: EventEmitter<CodEndleaf>;
  @Output()
  public editorClose: EventEmitter<any>;

  public location: FormControl<string | null>;
  public material: FormControl<string | null>;
  public chronotope: FormControl<AssertedChronotope | null>;
  public form: FormGroup;

  public initialChronotope?: AssertedChronotope;

  constructor(formBuilder: FormBuilder) {
    this.endleafChange = new EventEmitter<CodEndleaf>();
    this.editorClose = new EventEmitter<any>();
    this.locations = [];
    // form
    this.location = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.material = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.chronotope = formBuilder.control(null);
    this.form = formBuilder.group({
      location: this.location,
      material: this.material,
      chronotope: this.chronotope,
    });
  }

  ngOnInit(): void {
    if (this._endleaf) {
      this.updateForm(this._endleaf);
    }
  }

  private updateForm(model: CodEndleaf | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.location.setValue(model.location);
    this.material.setValue(model.material);
    this.initialChronotope = model.chronotope;
    this.form.markAsPristine();
  }

  public onChronotopeChange(chronotope: AssertedChronotope | undefined): void {
    this.chronotope.setValue(chronotope || null);
    this.chronotope.markAsDirty();
  }

  private getModel(): CodEndleaf {
    return {
      location: this.location.value?.trim() || '',
      material: this.material.value?.trim() || '',
      chronotope: this.chronotope.value || undefined,
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._endleaf = this.getModel();
    this.endleafChange.emit(this._endleaf);
  }
}

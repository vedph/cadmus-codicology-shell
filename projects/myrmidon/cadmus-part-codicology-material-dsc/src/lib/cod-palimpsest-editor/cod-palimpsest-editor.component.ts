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

import { CodPalimpsest } from '../cod-material-dsc-part';

@Component({
  selector: 'cadmus-cod-palimpsest-editor',
  templateUrl: './cod-palimpsest-editor.component.html',
  styleUrls: ['./cod-palimpsest-editor.component.css'],
})
export class CodPalimpsestEditorComponent implements OnInit {
  private _palimpsest: CodPalimpsest | undefined;

  @Input()
  public get palimpsest(): CodPalimpsest | undefined {
    return this._palimpsest;
  }
  public set palimpsest(value: CodPalimpsest | undefined) {
    this._palimpsest = value;
    this.updateForm(value);
  }

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
  public palimpsestChange: EventEmitter<CodPalimpsest>;
  @Output()
  public editorClose: EventEmitter<any>;

  public range: FormControl;
  public chronotope: FormControl;
  public note: FormControl;
  public form: FormGroup;

  public initialRange?: CodLocationRange;
  public initialChronotope?: AssertedChronotope;

  constructor(formBuilder: FormBuilder) {
    this.palimpsestChange = new EventEmitter<CodPalimpsest>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.range = formBuilder.control(null, Validators.required);
    this.chronotope = formBuilder.control(null);
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      range: this.range,
      chronotope: this.chronotope,
      note: this.note,
    });
  }

  ngOnInit(): void {
    if (this._palimpsest) {
      this.updateForm(this._palimpsest);
    }
  }

  private updateForm(palimpsest: CodPalimpsest | undefined): void {
    if (!palimpsest) {
      this.form.reset();
      return;
    }

    this.initialRange = palimpsest.range;
    this.initialChronotope = palimpsest.chronotope;
    this.note.setValue(palimpsest.note);

    this.form.markAsPristine();
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.range.setValue(ranges?.length ? ranges[0] : undefined);
    this.range.updateValueAndValidity();
    this.range.markAsDirty();
  }

  public onChronotopeChange(chronotope: AssertedChronotope | null): void {
    this.chronotope.setValue(chronotope);
    this.chronotope.updateValueAndValidity();
    this.chronotope.markAsDirty();
  }

  private getModel(): CodPalimpsest | null {
    return {
      range: this.range.value,
      chronotope: this.chronotope.value,
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
    this.palimpsestChange.emit(model);
  }
}

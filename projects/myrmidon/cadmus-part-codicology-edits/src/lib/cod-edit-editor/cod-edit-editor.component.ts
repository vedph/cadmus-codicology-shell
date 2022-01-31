import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import { HistoricalDateModel } from '@myrmidon/cadmus-refs-historical-date';

import { CodEdit } from '../cod-edits-part';

@Component({
  selector: 'cadmus-cod-edit-editor',
  templateUrl: './cod-edit-editor.component.html',
  styleUrls: ['./cod-edit-editor.component.css'],
})
export class CodEditEditorComponent implements OnInit {
  private _model: CodEdit | undefined;

  @Input()
  public get model(): CodEdit | undefined {
    return this._model;
  }
  public set model(value: CodEdit | undefined) {
    this._model = value;
    this.updateForm(value);
  }

  // cod-edit-types
  @Input()
  public typeEntries: ThesaurusEntry[] | undefined;
  // cod-edit-tags
  @Input()
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-edit-techniques
  @Input()
  public techEntries: ThesaurusEntry[] | undefined;
  // cod-edit-languages
  @Input()
  public langEntries: ThesaurusEntry[] | undefined;
  // cod-edit-colors
  @Input()
  public colorEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  @Input()
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  @Input()
  public refTagEntries: ThesaurusEntry[] | undefined;

  @Output()
  public modelChange: EventEmitter<CodEdit>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl;
  public type: FormControl;
  public tag: FormControl;
  public techniques: FormControl;
  public ranges: FormControl;
  public language: FormControl;
  public date: FormControl;
  public colors: FormControl;
  public description: FormControl;
  public text: FormControl;
  public references: FormControl;
  public form: FormGroup;

  public initialTechniques?: string[];
  public initialRanges?: CodLocationRange[];
  public initialDate?: HistoricalDateModel;
  public initialColors?: string[];
  public initialReferences?: DocReference[];

  constructor(formBuilder: FormBuilder) {
    this.modelChange = new EventEmitter<CodEdit>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.techniques = formBuilder.control([]);
    this.ranges = formBuilder.control([]);
    this.language = formBuilder.control(null, Validators.maxLength(50));
    this.colors = formBuilder.control([]);
    this.date = formBuilder.control(null);
    this.description = formBuilder.control(null, Validators.maxLength(1000));
    this.text = formBuilder.control(null, Validators.maxLength(1000));
    this.references = formBuilder.control([]);
    this.form = formBuilder.group({
      eid: this.eid,
      type: this.type,
      tag: this.tag,
      techniques: this.techniques,
      ranges: this.ranges,
      language: this.language,
      date: this.date,
      colors: this.colors,
      description: this.description,
      text: this.text,
      references: this.references,
    });
  }

  ngOnInit(): void {
    if (this._model) {
      this.updateForm(this._model);
    }
  }

  private updateForm(model: CodEdit | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.eid.setValue(model.eid);
    this.type.setValue(model.type);
    this.tag.setValue(model.tag);
    this.initialTechniques = model.techniques || [];
    this.initialRanges = model.ranges || [];
    this.language.setValue(model.language);
    this.initialDate = model.date;
    this.initialColors = model.colors || [];
    this.description.setValue(model.description);
    this.text.setValue(model.text);
    this.initialReferences = model.references || [];

    this.form.markAsPristine();
  }

  private getModel(): CodEdit | null {
    return {
      eid: this.eid.value?.trim(),
      type: this.type.value?.trim(),
      tag: this.tag.value?.trim(),
      techniques: this.techniques.value?.length
        ? this.techniques.value
        : undefined,
      ranges: this.ranges.value?.length ? this.ranges.value : undefined,
      language: this.language.value?.trim(),
      date: this.date.value,
      colors: this.colors.value?.length ? this.colors.value : undefined,
      description: this.description.value?.trim(),
      text: this.text.value?.trim(),
      references: this.references.value?.length
        ? this.references.value
        : undefined,
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

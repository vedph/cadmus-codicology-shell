import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import { HistoricalDateModel } from '@myrmidon/cadmus-refs-historical-date';
import { Flag } from '@myrmidon/cadmus-ui-flags-picker';
import { NgToolsValidators } from '@myrmidon/ng-tools';

import { CodEdit } from '../cod-edits-part';

@Component({
  selector: 'cadmus-cod-edit-editor',
  templateUrl: './cod-edit-editor.component.html',
  styleUrls: ['./cod-edit-editor.component.css'],
})
export class CodEditEditorComponent implements OnInit {
  private _edit: CodEdit | undefined;
  private _colorEntries: ThesaurusEntry[] | undefined;
  private _techEntries: ThesaurusEntry[] | undefined;

  @Input()
  public get edit(): CodEdit | undefined {
    return this._edit;
  }
  public set edit(value: CodEdit | undefined) {
    if (this._edit === value) {
      return;
    }
    this._edit = value;
    this.updateForm(value);
  }

  // cod-edit-colors
  @Input()
  public get colorEntries(): ThesaurusEntry[] | undefined {
    return this._colorEntries;
  }
  public set colorEntries(value: ThesaurusEntry[] | undefined) {
    this._colorEntries = value;
    this.availColors = value?.length
      ? value.map((e) => {
          return {
            id: e.id,
            label: e.value,
          } as Flag;
        })
      : [];
  }
  // cod-edit-techniques
  @Input()
  public get techEntries(): ThesaurusEntry[] | undefined {
    return this._techEntries;
  }
  public set techEntries(value: ThesaurusEntry[] | undefined) {
    this._techEntries = value;
    this.availTechs = value?.length
      ? value.map((e) => {
          return {
            id: e.id,
            label: e.value,
          } as Flag;
        })
      : [];
  }
  // cod-edit-types
  @Input()
  public typeEntries: ThesaurusEntry[] | undefined;
  // cod-edit-tags
  @Input()
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-edit-languages
  @Input()
  public langEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  @Input()
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  @Input()
  public refTagEntries: ThesaurusEntry[] | undefined;

  @Output()
  public editChange: EventEmitter<CodEdit>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl<string | null>;
  public type: FormControl<string | null>;
  public tag: FormControl<string | null>;
  public techniques: FormControl<string[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public language: FormControl<string | null>;
  public date: FormControl<HistoricalDateModel | null>;
  public colors: FormControl<string[]>;
  public description: FormControl<string | null>;
  public text: FormControl<string | null>;
  public references: FormControl<DocReference[]>;
  public form: FormGroup;

  public initialRanges?: CodLocationRange[];
  public initialDate?: HistoricalDateModel;
  public availColors?: Flag[];
  public initialColorIds?: string[];
  public availTechs?: Flag[];
  public initialTechIds?: string[];
  public initialReferences?: DocReference[];

  constructor(formBuilder: FormBuilder) {
    this.editChange = new EventEmitter<CodEdit>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.techniques = formBuilder.control([], { nonNullable: true });
    this.ranges = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.language = formBuilder.control(null, Validators.maxLength(50));
    this.colors = formBuilder.control([], { nonNullable: true });
    this.date = formBuilder.control(null);
    this.description = formBuilder.control(null, Validators.maxLength(1000));
    this.text = formBuilder.control(null, Validators.maxLength(1000));
    this.references = formBuilder.control([], { nonNullable: true });
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
    if (this._edit) {
      this.updateForm(this._edit);
    }
  }

  private updateForm(model: CodEdit | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.eid.setValue(model.eid || null);
    this.type.setValue(model.type);
    this.tag.setValue(model.tag || null);
    this.initialTechIds = model.techniques || [];
    this.initialRanges = model.ranges || [];
    this.language.setValue(model.language || null);
    this.initialDate = model.date;
    this.initialColorIds = model.colors || [];
    this.description.setValue(model.description || null);
    this.text.setValue(model.text || null);
    this.initialReferences = model.references || [];

    this.form.markAsPristine();
  }

  private getModel(): CodEdit | null {
    return {
      eid: this.eid.value?.trim(),
      type: this.type.value?.trim() || '',
      tag: this.tag.value?.trim(),
      techniques: this.techniques.value?.length
        ? this.techniques.value
        : undefined,
      ranges: this.ranges.value,
      language: this.language.value?.trim(),
      date: this.date.value || undefined,
      colors: this.colors.value?.length ? this.colors.value : undefined,
      description: this.description.value?.trim(),
      text: this.text.value?.trim(),
      references: this.references.value?.length
        ? this.references.value
        : undefined,
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onColorIdsChange(ids: string[]): void {
    this.colors.setValue(ids);
    this.colors.updateValueAndValidity();
    this.colors.markAsDirty();
  }

  public onTechIdsChange(ids: string[]): void {
    this.techniques.setValue(ids);
    this.techniques.updateValueAndValidity();
    this.techniques.markAsDirty();
  }

  public onReferencesChange(references: DocReference[]): void {
    this.references.setValue(references);
    this.references.updateValueAndValidity();
    this.references.markAsDirty();
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
    const model = this.getModel();
    if (!model) {
      return;
    }
    this.editChange.emit(model);
  }
}

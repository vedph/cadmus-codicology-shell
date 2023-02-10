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
import { Flag, FlagsPickerAdapter } from '@myrmidon/cadmus-ui-flags-picker';
import { NgToolsValidators } from '@myrmidon/ng-tools';
import { Observable } from 'rxjs';

import { CodEdit } from '../cod-edits-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-edit-editor',
  templateUrl: './cod-edit-editor.component.html',
  styleUrls: ['./cod-edit-editor.component.css'],
})
export class CodEditEditorComponent implements OnInit {
  private readonly _flagAdapter: FlagsPickerAdapter;
  private _edit: CodEdit | undefined;
  private _colorEntries: ThesaurusEntry[];
  private _techEntries: ThesaurusEntry[];

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
    if (this._colorEntries === value) {
      return;
    }
    this._colorEntries = value || [];
    this._flagAdapter.setSlotFlags(
      'colors',
      this._colorEntries.map(entryToFlag)
    );
  }
  // cod-edit-techniques
  @Input()
  public get techEntries(): ThesaurusEntry[] | undefined {
    return this._techEntries;
  }
  public set techEntries(value: ThesaurusEntry[] | undefined) {
    if (this._techEntries === value) {
      return;
    }
    this._techEntries = value || [];
    this._flagAdapter.setSlotFlags(
      'techniques',
      this._techEntries.map(entryToFlag)
    );
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
  public techniques: FormControl<Flag[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public language: FormControl<string | null>;
  public date: FormControl<HistoricalDateModel | null>;
  public colors: FormControl<Flag[]>;
  public description: FormControl<string | null>;
  public text: FormControl<string | null>;
  public references: FormControl<DocReference[]>;
  public form: FormGroup;

  // flags
  public colorFlags$: Observable<Flag[]>;
  public techniqueFlags$: Observable<Flag[]>;

  constructor(formBuilder: FormBuilder) {
    this.editChange = new EventEmitter<CodEdit>();
    this.editorClose = new EventEmitter<any>();
    // flags
    this._colorEntries = [];
    this._techEntries = [];
    this._flagAdapter = new FlagsPickerAdapter();
    this.colorFlags$ = this._flagAdapter.selectFlags('colors');
    this.techniqueFlags$ = this._flagAdapter.selectFlags('techniques');
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
    this._flagAdapter.setSlotChecks('techniques', model.techniques || []);
    this.ranges.setValue(model.ranges || []);
    this.language.setValue(model.language || null);
    this.date.setValue(model.date || null);
    this._flagAdapter.setSlotChecks('colors', model.colors || []);
    this.description.setValue(model.description || null);
    this.text.setValue(model.text || null);
    this.references.setValue(model.references || []);
    this.form.markAsPristine();
  }

  private getModel(): CodEdit {
    return {
      eid: this.eid.value?.trim(),
      type: this.type.value?.trim() || '',
      tag: this.tag.value?.trim(),
      techniques: this._flagAdapter.getOptionalCheckedFlagIds('techniques'),
      ranges: this.ranges.value,
      language: this.language.value?.trim(),
      date: this.date.value || undefined,
      colors: this._flagAdapter.getOptionalCheckedFlagIds('colors'),
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

  public onColorFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('colors', flags, true);
    this.colors.setValue(flags);
    this.colors.updateValueAndValidity();
    this.colors.markAsDirty();
  }

  public onTechniqueFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('techniques', flags, true);
    this.techniques.setValue(flags);
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
    this._edit = this.getModel();
    this.editChange.emit(this._edit);
  }
}

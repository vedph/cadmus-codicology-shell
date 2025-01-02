import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import {
  DocReference,
  DocReferencesComponent,
} from '@myrmidon/cadmus-refs-doc-references';
import {
  HistoricalDateModel,
  HistoricalDateComponent,
} from '@myrmidon/cadmus-refs-historical-date';

import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

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
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatOption,
    CodLocationComponent,
    AssertedCompositeIdsComponent,
    FlagSetComponent,
    MatCheckbox,
    HistoricalDateComponent,
    DocReferencesComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatButton,
  ],
})
export class CodEditEditorComponent implements OnInit {
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
    this.colorFlags = this._colorEntries.map(entryToFlag);
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
    this.techniqueFlags = this._techEntries.map(entryToFlag);
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
  // assertion-tags
  @Input()
  public assTagEntries: ThesaurusEntry[] | undefined;
  // external-id-tags
  @Input()
  public idTagEntries: ThesaurusEntry[] | undefined;
  // external-id-scopes
  @Input()
  public idScopeEntries: ThesaurusEntry[] | undefined;

  @Output()
  public editChange: EventEmitter<CodEdit>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl<string | null>;
  public type: FormControl<string | null>;
  public tag: FormControl<string | null>;
  public authorIds: FormControl<AssertedCompositeId[]>;
  public techniques: FormControl<string[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public language: FormControl<string | null>;
  public hasDate: FormControl<boolean>;
  public date: FormControl<HistoricalDateModel | null>;
  public colors: FormControl<string[]>;
  public description: FormControl<string | null>;
  public text: FormControl<string | null>;
  public references: FormControl<DocReference[]>;
  public form: FormGroup;

  // flags
  public colorFlags: Flag[] = [];
  public techniqueFlags: Flag[] = [];

  constructor(formBuilder: FormBuilder) {
    this.editChange = new EventEmitter<CodEdit>();
    this.editorClose = new EventEmitter<any>();
    // flags
    this._colorEntries = [];
    this._techEntries = [];
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.authorIds = formBuilder.control([], { nonNullable: true });
    this.techniques = formBuilder.control([], { nonNullable: true });
    this.ranges = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.language = formBuilder.control(null, Validators.maxLength(50));
    this.colors = formBuilder.control([], { nonNullable: true });
    this.hasDate = formBuilder.control(false, { nonNullable: true });
    this.date = formBuilder.control(null);
    this.description = formBuilder.control(null, Validators.maxLength(1000));
    this.text = formBuilder.control(null, Validators.maxLength(1000));
    this.references = formBuilder.control([], { nonNullable: true });
    this.form = formBuilder.group({
      eid: this.eid,
      type: this.type,
      tag: this.tag,
      authorIds: this.authorIds,
      techniques: this.techniques,
      ranges: this.ranges,
      language: this.language,
      hasDate: this.hasDate,
      date: this.date,
      colors: this.colors,
      description: this.description,
      text: this.text,
      references: this.references,
    });
  }

  public ngOnInit(): void {
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
    this.authorIds.setValue(model.authorIds || []);
    this.techniques.setValue(model.techniques || []);
    this.ranges.setValue(model.ranges || []);
    this.language.setValue(model.language || null);
    this.hasDate.setValue(model.date ? true : false);
    this.date.setValue(model.date || null);
    this.colors.setValue(model.colors || []);
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
      authorIds: this.authorIds.value?.length
        ? this.authorIds.value
        : undefined,
      techniques: this.techniques.value,
      ranges: this.ranges.value,
      language: this.language.value?.trim(),
      date: this.hasDate.value ? this.date.value || undefined : undefined,
      colors: this.colors.value,
      description: this.description.value?.trim(),
      text: this.text.value?.trim(),
      references: this.references.value?.length
        ? this.references.value
        : undefined,
    };
  }

  public onAuthorIdsChange(ids: AssertedCompositeId[]): void {
    this.authorIds.setValue(ids);
    this.authorIds.updateValueAndValidity();
    this.authorIds.markAsDirty();
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

  public onTechniqueIdsChange(ids: string[]): void {
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
    this._edit = this.getModel();
    this.editChange.emit(this._edit);
  }
}

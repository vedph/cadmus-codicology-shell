import { Component, effect, input, model, output } from '@angular/core';
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
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import { LookupDocReferencesComponent } from '@myrmidon/cadmus-refs-lookup';
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
    LookupDocReferencesComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodEditEditorComponent {
  public readonly edit = model<CodEdit>();

  // cod-edit-colors
  public readonly colorEntries = input<ThesaurusEntry[]>();
  // cod-edit-techniques
  public readonly techEntries = input<ThesaurusEntry[]>();
  // cod-edit-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // cod-edit-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // cod-edit-positions
  public readonly posEntries = input<ThesaurusEntry[]>();
  // cod-edit-languages
  public readonly langEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // external-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // external-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();

  public editorClose = output();

  public eid: FormControl<string | null>;
  public type: FormControl<string | null>;
  public tag: FormControl<string | null>;
  public authorIds: FormControl<AssertedCompositeId[]>;
  public techniques: FormControl<string[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public position: FormControl<string | null>;
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
    this.position = formBuilder.control(null, Validators.maxLength(50));
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
      position: this.position,
      language: this.language,
      hasDate: this.hasDate,
      date: this.date,
      colors: this.colors,
      description: this.description,
      text: this.text,
      references: this.references,
    });

    effect(() => {
      this.updateForm(this.edit());
    });

    effect(() => {
      this.colorFlags = this.colorEntries()?.map(entryToFlag) || [];
    });

    effect(() => {
      this.techniqueFlags = this.techEntries()?.map(entryToFlag) || [];
    });
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
    this.position.setValue(model.position || null);
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
      position: this.position.value?.trim() || undefined,
      language: this.language.value?.trim() || undefined,
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
    this.edit.set(this.getModel());
  }
}

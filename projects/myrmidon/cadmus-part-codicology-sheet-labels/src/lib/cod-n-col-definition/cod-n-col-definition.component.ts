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
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import {
  HistoricalDateModel,
  HistoricalDateComponent,
} from '@myrmidon/cadmus-refs-historical-date';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CodLocationComponent,
  CodLocationRange,
} from '@myrmidon/cadmus-cod-location';

import { CodNColDefinition } from '../cod-sheet-labels-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-n-col-definition',
  templateUrl: './cod-n-col-definition.component.html',
  styleUrls: ['./cod-n-col-definition.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatCheckbox,
    MatSelect,
    MatOption,
    MatError,
    FlagSetComponent,
    HistoricalDateComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
    AssertedCompositeIdsComponent,
    CodLocationComponent,
  ],
})
export class CodNColDefinitionComponent {
  public readonly definition = model<CodNColDefinition>();

  // cod-numbering-systems
  public readonly sysEntries = input<ThesaurusEntry[]>();
  // cod-numbering-techniques
  public readonly techEntries = input<ThesaurusEntry[]>();
  // cod-numbering-positions
  public readonly posEntries = input<ThesaurusEntry[]>();
  // cod-numbering-colors
  public readonly clrEntries = input<ThesaurusEntry[]>();

  // links:
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // external-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // external-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();
  // pin link settings
  // by-type: true/false
  public readonly pinByTypeMode = input<boolean>();
  // switch-mode: true/false
  public readonly canSwitchMode = input<boolean>();
  // edit-target: true/false
  public readonly canEditTarget = input<boolean>();

  public readonly editorClose = output();

  public id: string;
  public rank: FormControl<number>;
  public isPagination: FormControl<boolean>;
  public isByScribe: FormControl<boolean>;
  public system: FormControl<string | null>;
  public technique: FormControl<string | null>;
  public position: FormControl<string | null>;
  public colors: FormControl<string[]>;
  public hasDate: FormControl<boolean>;
  public date: FormControl<HistoricalDateModel | null>;
  public canonicalRanges: FormControl<CodLocationRange[]>;
  public links: FormControl<AssertedCompositeId[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  // flags
  public colorFlags: Flag[] = [];

  constructor(formBuilder: FormBuilder) {
    this.id = '';
    this.rank = formBuilder.control(0, { nonNullable: true });
    this.isPagination = formBuilder.control(false, { nonNullable: true });
    this.isByScribe = formBuilder.control(false, { nonNullable: true });
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
    this.colors = formBuilder.control([], { nonNullable: true });
    this.hasDate = formBuilder.control(false, { nonNullable: true });
    this.date = formBuilder.control(null);
    this.canonicalRanges = formBuilder.control([], { nonNullable: true });
    this.links = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      rank: this.rank,
      isPagination: this.isPagination,
      isByScribe: this.isByScribe,
      system: this.system,
      technique: this.technique,
      position: this.position,
      colors: this.colors,
      hasDate: this.hasDate,
      date: this.date,
      canonicalRanges: this.canonicalRanges,
      links: this.links,
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.definition());
    });

    effect(() => {
      this.colorFlags = this.clrEntries()?.map(entryToFlag) || [];
    });
  }

  private updateForm(model: CodNColDefinition | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.id = model.id;
    this.rank.setValue(model.rank || 0);
    this.isPagination.setValue(model.isPagination || false);
    this.isByScribe.setValue(model.isByScribe || false);
    this.system.setValue(model.system);
    this.technique.setValue(model.technique);
    this.position.setValue(model.position);
    this.colors.setValue(model.colors || []);
    this.hasDate.setValue(model.date ? true : false);
    this.date.setValue(model.date || null);
    this.canonicalRanges.setValue(model.canonicalRanges || []);
    this.links.setValue(model.links || []);
    this.note.setValue(model.note || null);
    this.form.markAsPristine();
  }

  private getModel(): CodNColDefinition {
    return {
      id: this.id,
      rank: +this.rank.value || 0,
      isPagination: this.isPagination.value ? true : undefined,
      isByScribe: this.isByScribe.value ? true : undefined,
      system: this.system.value?.trim() || '',
      technique: this.technique.value?.trim() || '',
      position: this.position.value?.trim() || '',
      colors: this.colors.value?.length ? this.colors.value : undefined,
      date: this.hasDate.value ? this.date.value || undefined : undefined,
      canonicalRanges: this.canonicalRanges.value?.length
        ? this.canonicalRanges.value
        : undefined,
      links: this.links.value?.length ? this.links.value : undefined,
      note: this.note.value?.trim(),
    };
  }

  public onColorIdsChange(ids: string[]): void {
    this.colors.setValue(ids);
    this.colors.updateValueAndValidity();
    this.colors.markAsDirty();
  }

  public onDateChange(date: HistoricalDateModel): void {
    this.date.setValue(date);
    this.date.updateValueAndValidity();
    this.date.markAsDirty();
  }

  public onLinkIdsChange(ids: AssertedCompositeId[]): void {
    this.links.setValue(ids);
    this.links.updateValueAndValidity();
    this.links.markAsDirty();
  }

  public onRangeChange(ranges: CodLocationRange[]): void {
    this.canonicalRanges.setValue(ranges);
    this.canonicalRanges.updateValueAndValidity();
    this.canonicalRanges.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.definition.set(this.getModel());
  }
}

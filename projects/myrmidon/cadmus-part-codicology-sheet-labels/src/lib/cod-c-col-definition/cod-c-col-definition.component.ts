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

import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodCColDefinition } from '../cod-sheet-labels-part';

@Component({
  selector: 'cadmus-cod-c-col-definition',
  templateUrl: './cod-c-col-definition.component.html',
  styleUrls: ['./cod-c-col-definition.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatError,
    MatCheckbox,
    MatIconButton,
    MatTooltip,
    MatIcon,
    AssertedCompositeIdsComponent,
  ],
})
export class CodCColDefinitionComponent {
  public readonly definition = model<CodCColDefinition>();

  // cod-catchwords-positions
  public readonly posEntries = input<ThesaurusEntry[]>();
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

  public readonly editorClose = output();

  public id: string;
  public rank: FormControl<number>;
  public position: FormControl<string | null>;
  public isVertical: FormControl<boolean>;
  public decoration: FormControl<string | null>;
  public links: FormControl<AssertedCompositeId[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.id = '';
    this.rank = formBuilder.control(0, { nonNullable: true });
    this.position = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.isVertical = formBuilder.control(false, { nonNullable: true });
    this.decoration = formBuilder.control(null, Validators.maxLength(1000));
    this.links = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      rank: this.rank,
      position: this.position,
      isVertical: this.isVertical,
      decoration: this.decoration,
      links: this.links,
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.definition());
    });
  }

  public onLinkIdsChange(ids: AssertedCompositeId[]): void {
    this.links.setValue(ids);
    this.links.updateValueAndValidity();
    this.links.markAsDirty();
  }

  private updateForm(model: CodCColDefinition | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.id = model.id;
    this.rank.setValue(model.rank || 0);
    this.position.setValue(model.position);
    this.isVertical.setValue(model.isVertical ? true : false);
    this.decoration.setValue(model.decoration || null);
    this.links.setValue(model.links || []);
    this.note.setValue(model.note || null);
    this.form.markAsPristine();
  }

  private getModel(): CodCColDefinition {
    return {
      id: this.id,
      rank: +this.rank.value || 0,
      position: this.position.value?.trim() || '',
      isVertical: this.isVertical.value ? true : false,
      decoration: this.decoration.value?.trim(),
      links: this.links.value || undefined,
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
    this.definition.set(this.getModel());
  }
}

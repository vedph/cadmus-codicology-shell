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
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  PhysicalSize,
  PhysicalSizeComponent,
} from '@myrmidon/cadmus-mat-physical-size';

import {
  AssertedChronotope,
  AssertedChronotopeComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';

import { CodBinding } from '../cod-bindings-part';

@Component({
  selector: 'cadmus-cod-binding-editor',
  templateUrl: './cod-binding-editor.component.html',
  styleUrls: ['./cod-binding-editor.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatError,
    MatCheckbox,
    PhysicalSizeComponent,
    AssertedChronotopeComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodBindingEditorComponent {
  public readonly binding = model<CodBinding>();

  // cod-binding-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // cod-binding-cover-materials
  public readonly coverEntries = input<ThesaurusEntry[]>();
  // cod-binding-board-materials
  public readonly boardEntries = input<ThesaurusEntry[]>();
  // chronotope-tags
  public readonly ctTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // physical-size-tags
  public readonly szTagEntries = input<ThesaurusEntry[]>();
  // physical-size-dim-tags
  public readonly szDimTagEntries = input<ThesaurusEntry[]>();
  // physical-size-units
  public readonly szUnitEntries = input<ThesaurusEntry[]>();

  public editorClose = output();

  public tag: FormControl<string | null>;
  public coverMaterial: FormControl<string | null>;
  public boardMaterial: FormControl<string | null>;
  public chronotope: FormControl<AssertedChronotope | null>;
  public size: FormControl<PhysicalSize | null>;
  public hasSize: FormControl<boolean>;
  public description: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.coverMaterial = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.boardMaterial = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.chronotope = formBuilder.control(null, Validators.required);
    this.size = formBuilder.control(null);
    this.hasSize = formBuilder.control(false, { nonNullable: true });
    this.description = formBuilder.control(null, Validators.maxLength(5000));
    this.form = formBuilder.group({
      tag: this.tag,
      coverMaterial: this.coverMaterial,
      boardMaterial: this.boardMaterial,
      chronotope: this.chronotope,
      size: this.size,
      hasSize: this.hasSize,
      description: this.description,
    });

    effect(() => {
      this.updateForm(this.binding());
    });
  }

  private updateForm(model: CodBinding | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.tag.setValue(model.tag || null);
    this.coverMaterial.setValue(model.coverMaterial);
    this.boardMaterial.setValue(model.boardMaterial);
    this.description.setValue(model.description || null);
    this.size.setValue(model.size || null);
    this.hasSize.setValue(model.size ? true : false);
    this.chronotope.setValue(model.chronotope || null);
    this.form.markAsPristine();
  }

  private getModel(): CodBinding {
    return {
      tag: this.tag.value?.trim(),
      coverMaterial: this.coverMaterial.value?.trim() || '',
      boardMaterial: this.boardMaterial.value?.trim() || '',
      chronotope: this.chronotope.value!,
      size: this.hasSize.value ? this.size.value || undefined : undefined,
      description: this.description.value?.trim(),
    };
  }

  public onSizeChange(size: PhysicalSize): void {
    this.size.setValue(size);
    this.size.markAsDirty();
  }

  public onChronotopeChange(chronotope: AssertedChronotope | undefined): void {
    this.chronotope.setValue(chronotope || null);
    this.chronotope.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.binding.set(this.getModel());
  }
}

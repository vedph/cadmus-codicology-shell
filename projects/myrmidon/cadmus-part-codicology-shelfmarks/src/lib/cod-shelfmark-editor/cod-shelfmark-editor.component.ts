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
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodShelfmark } from '../cod-shelfmarks-part';

@Component({
  selector: 'cadmus-cod-shelfmark-editor',
  templateUrl: './cod-shelfmark-editor.component.html',
  styleUrls: ['./cod-shelfmark-editor.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatError,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodShelfmarkEditorComponent {
  public readonly shelfmark = model<CodShelfmark>();

  // cod-shelfmark-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // cod-shelfmark-libraries
  public readonly libEntries = input<ThesaurusEntry[]>();

  public editorClose = output();

  public tag: FormControl<string | null>;
  public city: FormControl<string | null>;
  public library: FormControl<string | null>;
  public fund: FormControl<string | null>;
  public location: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.city = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.library = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.fund = formBuilder.control(null, Validators.maxLength(50));
    this.location = formBuilder.control(null, Validators.maxLength(50));

    this.form = formBuilder.group({
      tag: this.tag,
      city: this.city,
      library: this.library,
      fund: this.fund,
      location: this.location,
    });

    effect(() => {
      this.updateForm(this.shelfmark());
    });
  }

  private updateForm(model: CodShelfmark | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.tag.setValue(model.tag || null);
    this.city.setValue(model.city);
    this.library.setValue(model.library);
    this.fund.setValue(model.fund || null);
    this.location.setValue(model.location);
    this.form.markAsPristine();
  }

  private getModel(): CodShelfmark {
    return {
      tag: this.tag.value?.trim(),
      city: this.city.value?.trim() || '',
      library: this.library.value?.trim() || '',
      fund: this.fund.value?.trim(),
      location: this.location.value?.trim() || '',
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.shelfmark.set(this.getModel());
  }
}

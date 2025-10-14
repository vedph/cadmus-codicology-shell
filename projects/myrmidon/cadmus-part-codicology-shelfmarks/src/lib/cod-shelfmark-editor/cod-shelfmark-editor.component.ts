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
  // cod-shelfmark-cities
  public readonly cityEntries = input<ThesaurusEntry[]>();
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
    this.city = formBuilder.control(null, Validators.maxLength(100));
    this.library = formBuilder.control(null, Validators.maxLength(100));
    this.fund = formBuilder.control(null, Validators.maxLength(100));
    this.location = formBuilder.control(null, Validators.maxLength(100));

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
    this.city.setValue(model.city || null);
    this.library.setValue(model.library || null);
    this.fund.setValue(model.fund || null);
    this.location.setValue(model.location || null);
    this.form.markAsPristine();
  }

  private getModel(): CodShelfmark {
    return {
      tag: this.tag.value?.trim() || undefined,
      city: this.city.value?.trim() || undefined,
      library: this.library.value?.trim() || undefined,
      fund: this.fund.value?.trim() || undefined,
      location: this.location.value?.trim() || undefined,
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

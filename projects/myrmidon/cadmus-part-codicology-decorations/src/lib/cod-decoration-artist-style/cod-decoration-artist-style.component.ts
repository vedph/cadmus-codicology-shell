import {
  Component,
  effect,
  EventEmitter,
  input,
  Input,
  model,
  OnInit,
  output,
  Output,
} from '@angular/core';
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
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  AssertedChronotope,
  AssertedChronotopeComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import { Assertion, AssertionComponent } from '@myrmidon/cadmus-refs-assertion';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodDecorationArtistStyle } from '../cod-decorations-part';

@Component({
  selector: 'cadmus-cod-decoration-artist-style',
  templateUrl: './cod-decoration-artist-style.component.html',
  styleUrls: ['./cod-decoration-artist-style.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatCheckbox,
    AssertedChronotopeComponent,
    AssertionComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodDecorationArtistStyleComponent implements OnInit {
  public readonly style = model<CodDecorationArtistStyle>();

  // chronotope-tags
  public readonly ctTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  public name: FormControl<string | null>;
  public hasChronotope: FormControl<boolean>;
  public chronotope: FormControl<AssertedChronotope | null>;
  public hasAssertion: FormControl<boolean>;
  public assertion: FormControl<Assertion | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.name = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.hasChronotope = formBuilder.control(false, { nonNullable: true });
    this.chronotope = formBuilder.control(null);
    this.hasAssertion = formBuilder.control(false, { nonNullable: true });
    this.assertion = formBuilder.control(null);
    this.form = formBuilder.group({
      name: this.name,
      hasChronotope: this.hasChronotope,
      chronotope: this.chronotope,
      hasAssertion: this.hasAssertion,
      assertion: this.assertion,
    });

    effect(() => {
      this.updateForm(this.style());
    });
  }

  ngOnInit(): void {}

  private updateForm(style: CodDecorationArtistStyle | undefined): void {
    if (!style) {
      this.form.reset();
      return;
    }
    this.name.setValue(style.name);
    this.hasChronotope.setValue(style.chronotope ? true : false);
    this.hasAssertion.setValue(style.assertion ? true : false);
    this.chronotope.setValue(style.chronotope || null);
    this.assertion.setValue(style.assertion || null);
    this.form.markAsPristine();
  }

  public onChronotopeChange(chronotope: AssertedChronotope | undefined): void {
    this.chronotope.setValue(chronotope || null);
    this.chronotope.updateValueAndValidity();
    this.chronotope.markAsDirty();
  }

  public onAssertionChange(assertion: Assertion | undefined): void {
    this.assertion.setValue(assertion || null);
    this.assertion.updateValueAndValidity();
    this.assertion.markAsDirty();
  }

  private getStyle(): CodDecorationArtistStyle {
    return {
      name: this.name.value?.trim() || '',
      chronotope: this.hasChronotope.value
        ? this.chronotope.value || undefined
        : undefined,
      assertion: this.hasAssertion.value
        ? this.assertion.value || undefined
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
    this.style.set(this.getStyle());
  }
}

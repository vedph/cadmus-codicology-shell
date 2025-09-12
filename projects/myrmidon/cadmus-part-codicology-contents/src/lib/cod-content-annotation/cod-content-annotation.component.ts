import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

// material
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';

// myrmidon
import { NgxToolsValidators } from '@myrmidon/ngx-tools';

// bricks
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

// cadmus
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

// local
import { CodContentAnnotation } from '../cod-contents-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-content-annotation',
  templateUrl: './cod-content-annotation.component.html',
  styleUrls: ['./cod-content-annotation.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    // material
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatTooltip,
    // bricks
    CodLocationComponent,
    FlagSetComponent,
  ],
})
export class CodContentAnnotationComponent {
  public readonly annotation = model<CodContentAnnotation>();

  // cod-content-annotation-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // cod-content-annotation-features
  public readonly featureEntries = input<ThesaurusEntry[]>();
  // cod-content-annotation-languages
  public readonly langEntries = input<ThesaurusEntry[]>();

  public editorClose = output();

  public type: FormControl<string | null>;
  public ranges: FormControl<CodLocationRange[]>;
  public features: FormControl<string[]>;
  public languages: FormControl<string[]>;
  public incipit: FormControl<string | null>;
  public explicit: FormControl<string | null>;
  public text: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  public featFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || []
  );

  public langFlags = computed<Flag[]>(
    () => this.langEntries()?.map((e) => entryToFlag(e)) || []
  );

  constructor(formBuilder: FormBuilder) {
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.ranges = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.features = formBuilder.control([], { nonNullable: true });
    this.languages = formBuilder.control([], { nonNullable: true });
    this.incipit = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(500),
    ]);
    this.explicit = formBuilder.control(null, Validators.maxLength(500));
    this.text = formBuilder.control(null, Validators.maxLength(1000));
    this.note = formBuilder.control(null, Validators.maxLength(5000));
    this.form = formBuilder.group({
      type: this.type,
      ranges: this.ranges,
      features: this.features,
      languages: this.languages,
      incipit: this.incipit,
      explicit: this.explicit,
      note: this.note,
      text: this.text,
    });

    effect(() => {
      this.updateForm(this.annotation());
    });
  }

  private updateForm(model: CodContentAnnotation | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.type.setValue(model.type);
    this.ranges.setValue([model.range]);
    this.features.setValue(model.features || []);
    this.languages.setValue(model.languages || []);
    this.incipit.setValue(model.incipit);
    this.explicit.setValue(model.explicit || null);
    this.text.setValue(model.text || null);
    this.note.setValue(model.note || null);
    this.form.markAsPristine();
  }

  private getAnnotation(): CodContentAnnotation {
    return {
      type: this.type.value?.trim() || '',
      range: this.ranges.value.length ? this.ranges.value[0] : (null as any),
      features: this.features.value || [],
      languages: this.languages.value || [],
      incipit: this.incipit.value?.trim() || '',
      explicit: this.explicit.value?.trim() || '',
      text: this.text.value?.trim() || '',
      note: this.note.value?.trim() || undefined,
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onFeatCheckedIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public onLangCheckedIdsChange(ids: string[]): void {
    this.languages.setValue(ids);
    this.languages.markAsDirty();
    this.languages.updateValueAndValidity();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.annotation.set(this.getAnnotation());
  }
}

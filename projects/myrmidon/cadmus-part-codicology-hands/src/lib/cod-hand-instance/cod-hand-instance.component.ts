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
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatInput } from '@angular/material/input';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import {
  AssertedChronotope,
  AssertedChronotopeComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { CodImage, CodImagesComponent } from '@myrmidon/cadmus-codicology-ui';

import { CodHandInstance } from '../cod-hands-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-hand-instance',
  templateUrl: './cod-hand-instance.component.html',
  styleUrls: ['./cod-hand-instance.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatInput,
    MatError,
    CodLocationComponent,
    FlagSetComponent,
    AssertedChronotopeComponent,
    CodImagesComponent,
  ],
})
export class CodHandInstanceComponent {
  public readonly instance = model<CodHandInstance>();

  /**
   * The keys of all the descriptions entered in this part.
   * This is used as a lookup, scoped to the currently edited part.
   */
  public readonly dscKeys = input<string[]>();

  // cod-hand-scripts (required)
  public readonly scriptEntries = input<ThesaurusEntry[]>();
  // cod-hand-typologies
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // cod-hand-colors
  public readonly colorEntries = input<ThesaurusEntry[]>();
  // chronotope-tags
  public readonly ctTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // cod-image-types
  public readonly imgTypeEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  public script: FormControl<ThesaurusEntry | null>;
  public scripts: FormControl<ThesaurusEntry[]>;
  public typologies: FormControl<string[]>;
  public colors: FormControl<string[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public rank: FormControl<number>;
  public dscKey: FormControl<string | null>;
  public chronotope: FormControl<AssertedChronotope | null>;
  public images: FormControl<CodImage[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  // flags
  public readonly typologyFlags = computed(
    () => this.typeEntries()?.map(entryToFlag) || []
  );
  public readonly colorFlags = computed(
    () => this.colorEntries()?.map(entryToFlag) || []
  );

  constructor(formBuilder: FormBuilder) {
    // form
    this.script = formBuilder.control(null);
    this.scripts = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.rank = formBuilder.control(0, { nonNullable: true });
    this.dscKey = formBuilder.control(null);
    this.typologies = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.colors = formBuilder.control([], { nonNullable: true });
    this.ranges = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.chronotope = formBuilder.control(null);
    this.images = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, {
      validators: Validators.maxLength(1000),
    });
    this.form = formBuilder.group({
      scripts: this.scripts,
      rank: this.rank,
      dscKey: this.dscKey,
      typologies: this.typologies,
      colors: this.colors,
      ranges: this.ranges,
      chronotope: this.chronotope,
      images: this.images,
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.instance());
    });
  }

  private updateForm(model: CodHandInstance | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.scripts.setValue(
      model.scripts.map(
        (id) =>
          this.scriptEntries()?.find((e) => e.id === id) ?? {
            id: id,
            value: id,
          }
      )
    );
    this.rank.setValue(model.rank || 0);
    this.dscKey.setValue(model.descriptionKey || null);
    // update the typologies control while setting typologies,
    // because it is involved in form's validation
    this.typologies.setValue(model.typologies);
    this.colors.setValue(model.colors || []);
    this.ranges.setValue(model.ranges);
    this.chronotope.setValue(model.chronotope || null);
    this.images.setValue(model.images || []);
    this.note.setValue(model.note || null);
    this.form.markAsPristine();
  }

  private getModel(): CodHandInstance {
    return {
      scripts: this.scripts.value.map((e) => e.id),
      rank: this.rank.value ? +this.rank.value : 0,
      descriptionKey: this.dscKey.value || undefined,
      typologies: this.typologies.value,
      colors: this.colors.value?.length ? this.colors.value : undefined,
      ranges: this.ranges.value || [],
      chronotope: this.chronotope.value || undefined,
      images: this.images.value?.length ? this.images.value : undefined,
      note: this.note.value || undefined,
    };
  }

  public onTypologyIdsChange(ids: string[]): void {
    this.typologies.setValue(ids);
    this.typologies.updateValueAndValidity();
    this.typologies.markAsDirty();
  }

  public onColorIdsChange(ids: string[]): void {
    this.colors.setValue(ids);
    this.colors.updateValueAndValidity();
    this.colors.markAsDirty();
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onChronotopeChange(chronotope: AssertedChronotope) {
    this.chronotope.setValue(chronotope);
    this.chronotope.updateValueAndValidity();
    this.chronotope.markAsDirty();
  }

  public onImagesChange(images: CodImage[] | undefined): void {
    this.images.setValue(images || []);
    this.images.updateValueAndValidity();
    this.images.markAsDirty();
  }

  public addScript(): void {
    const entry = this.script.value;
    if (!entry) {
      return;
    }
    if (this.scripts.value.some((e) => e.id === entry.id)) {
      return;
    }
    this.scripts.setValue([...this.scripts.value, entry]);
    this.scripts.updateValueAndValidity();
    this.scripts.markAsDirty();
  }

  public deleteScript(index: number): void {
    const scripts = [...this.scripts.value];
    scripts.splice(index, 1);
    this.scripts.setValue(scripts);
    this.scripts.updateValueAndValidity();
    this.scripts.markAsDirty();
  }

  public moveScriptUp(index: number): void {
    if (index < 1) {
      return;
    }
    const scripts = [...this.scripts.value];
    const e = scripts[index];
    scripts[index] = scripts[index - 1];
    scripts[index - 1] = e;
    this.scripts.setValue(scripts);
    this.scripts.updateValueAndValidity();
    this.scripts.markAsDirty();
  }

  public moveScriptDown(index: number): void {
    if (index + 1 >= this.scripts.value.length) {
      return;
    }
    const scripts = [...this.scripts.value];
    const e = scripts[index];
    scripts[index] = scripts[index + 1];
    scripts[index + 1] = e;
    this.scripts.setValue(scripts);
    this.scripts.updateValueAndValidity();
    this.scripts.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.instance.set(this.getModel());
  }
}

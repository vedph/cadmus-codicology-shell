import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { CodImage } from '@myrmidon/cadmus-codicology-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { Flag, FlagsPickerAdapter } from '@myrmidon/cadmus-ui-flags-picker';
import { NgToolsValidators } from '@myrmidon/ng-tools';

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
  standalone: false,
})
export class CodHandInstanceComponent implements OnInit {
  private readonly _flagAdapter: FlagsPickerAdapter;
  private _instance: CodHandInstance | undefined;
  private _typologyEntries: ThesaurusEntry[] | undefined;
  private _colorEntries: ThesaurusEntry[] | undefined;

  @Input()
  public get instance(): CodHandInstance | undefined {
    return this._instance;
  }
  public set instance(value: CodHandInstance | undefined) {
    if (this._instance === value) {
      return;
    }
    this._instance = value;
    this.updateForm(value);
  }

  /**
   * The keys of all the descriptions entered in this part.
   * This is used as a lookup, scoped to the currently edited part.
   */
  @Input()
  public dscKeys: string[] | undefined;

  // cod-hand-scripts (required)
  @Input()
  public scriptEntries: ThesaurusEntry[] | undefined;
  // cod-hand-typologies
  @Input()
  public get typeEntries(): ThesaurusEntry[] | undefined {
    return this._typologyEntries;
  }
  public set typeEntries(value: ThesaurusEntry[] | undefined) {
    if (this._typologyEntries === value) {
      return;
    }
    this._typologyEntries = value || [];
    this._flagAdapter.setSlotFlags(
      'typologies',
      this._typologyEntries.map(entryToFlag)
    );
  }
  // cod-hand-colors
  @Input()
  public get colorEntries(): ThesaurusEntry[] | undefined {
    return this._colorEntries;
  }
  public set colorEntries(value: ThesaurusEntry[] | undefined) {
    if (this._colorEntries === value) {
      return;
    }
    this._colorEntries = value || [];
    this._flagAdapter.setSlotFlags(
      'colors',
      this._colorEntries.map(entryToFlag)
    );
  }

  // chronotope-tags
  @Input()
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  @Input()
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  @Input()
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  @Input()
  public refTagEntries: ThesaurusEntry[] | undefined;
  // cod-image-types
  @Input()
  public imgTypeEntries: ThesaurusEntry[] | undefined;

  @Output()
  public instanceChange: EventEmitter<CodHandInstance>;
  @Output()
  public editorClose: EventEmitter<any>;

  public script: FormControl<ThesaurusEntry | null>;
  public scripts: FormControl<ThesaurusEntry[]>;
  public typologies: FormControl<Flag[]>;
  public colors: FormControl<Flag[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public rank: FormControl<number>;
  public dscKey: FormControl<string | null>;
  public chronotope: FormControl<AssertedChronotope | null>;
  public images: FormControl<CodImage[]>;
  public form: FormGroup;

  // flags
  public typologyFlags$: Observable<Flag[]>;
  public colorFlags$: Observable<Flag[]>;

  constructor(formBuilder: FormBuilder) {
    this.instanceChange = new EventEmitter<CodHandInstance>();
    this.editorClose = new EventEmitter<any>();
    // flags
    this._flagAdapter = new FlagsPickerAdapter();
    this.typologyFlags$ = this._flagAdapter.selectFlags('typologies');
    this.colorFlags$ = this._flagAdapter.selectFlags('colors');
    // form
    this.script = formBuilder.control(null);
    this.scripts = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.rank = formBuilder.control(0, { nonNullable: true });
    this.dscKey = formBuilder.control(null);
    this.typologies = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.colors = formBuilder.control([], { nonNullable: true });
    this.ranges = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.chronotope = formBuilder.control(null);
    this.images = formBuilder.control([], { nonNullable: true });
    this.form = formBuilder.group({
      scripts: this.scripts,
      rank: this.rank,
      dscKey: this.dscKey,
      typologies: this.typologies,
      colors: this.colors,
      ranges: this.ranges,
      chronotope: this.chronotope,
      images: this.images,
    });
  }

  ngOnInit(): void {}

  private updateForm(model: CodHandInstance | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.scripts.setValue(
      model.scripts.map(
        (id) =>
          this.scriptEntries?.find((e) => e.id === id) ?? {
            id: id,
            value: id,
          }
      )
    );
    this.rank.setValue(model.rank || 0);
    this.dscKey.setValue(model.descriptionKey || null);
    // update the typologies control while setting typologies,
    // because it is involved in form's validation
    this.typologies.setValue(
      this._flagAdapter.setSlotChecks('typologies', model.typologies)
    );
    this._flagAdapter.setSlotChecks('colors', model.colors || []);
    this.ranges.setValue(model.ranges);
    this.chronotope.setValue(model.chronotope || null);
    this.images.setValue(model.images || []);
    this.form.markAsPristine();
  }

  private getModel(): CodHandInstance {
    return {
      scripts: this.scripts.value.map((e) => e.id),
      rank: this.rank.value ? +this.rank.value : 0,
      descriptionKey: this.dscKey.value || undefined,
      typologies: this._flagAdapter.getCheckedFlagIds('typologies'),
      colors: this._flagAdapter.getOptionalCheckedFlagIds('colors'),
      ranges: this.ranges.value || [],
      chronotope: this.chronotope.value || undefined,
      images: this.images.value?.length ? this.images.value : undefined,
    };
  }

  public onTypologyFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('typologies', flags, true);
    this.typologies.setValue(flags);
    this.typologies.updateValueAndValidity();
    this.typologies.markAsDirty();
  }

  public onColorFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('colors', flags, true);
    this.colors.setValue(flags);
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
    this._instance = this.getModel();
    this.instanceChange.emit(this._instance);
  }
}

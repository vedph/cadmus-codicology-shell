import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { CodImage } from '@myrmidon/cadmus-codicology-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { Flag } from '@myrmidon/cadmus-ui-flags-picker';
import { NgToolsValidators } from '@myrmidon/ng-tools';

import { CodHandInstance } from '../cod-hands-part';

@Component({
  selector: 'cadmus-cod-hand-instance',
  templateUrl: './cod-hand-instance.component.html',
  styleUrls: ['./cod-hand-instance.component.css'],
})
export class CodHandInstanceComponent implements OnInit {
  private _instance: CodHandInstance | undefined;

  @Input()
  public get instance(): CodHandInstance | undefined {
    return this._instance;
  }
  public set instance(value: CodHandInstance | undefined) {
    this._instance = value;
    this.updateForm(value);
  }

  /**
   * The keys of all the descriptions entered in this part.
   * This is used as a lookup, scoped to the currently edited part.
   */
  @Input()
  public dscKeys: string[] | undefined;

  // cod-hand-scripts
  @Input()
  public scriptEntries: ThesaurusEntry[] | undefined;
  // cod-hand-typologies
  @Input()
  public typeEntries: ThesaurusEntry[] | undefined;
  // cod-hand-colors
  @Input()
  public colorEntries: ThesaurusEntry[] | undefined;
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

  public script: FormControl;
  public rank: FormControl;
  public dscKey: FormControl;
  public typologies: FormControl;
  public colors: FormControl;
  public ranges: FormControl;
  public chronotope: FormControl;
  public images: FormControl;
  public form: FormGroup;

  public typFlags: Flag[];
  public initialTypologies: string[];

  public clrFlags: Flag[];
  public initialColors: string[];

  public initialRanges: CodLocationRange[];

  public initialChronotope?: AssertedChronotope;

  public initialImages: CodImage[];

  constructor(formBuilder: FormBuilder) {
    this.instanceChange = new EventEmitter<CodHandInstance>();
    this.editorClose = new EventEmitter<any>();
    this.typFlags = [];
    this.initialTypologies = [];
    this.clrFlags = [];
    this.initialColors = [];
    this.initialRanges = [];
    this.initialImages = [];
    // form
    this.script = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.rank = formBuilder.control(0);
    this.dscKey = formBuilder.control(null);
    this.typologies = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.colors = formBuilder.control([]);
    this.ranges = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.chronotope = formBuilder.control(null);
    this.images = formBuilder.control([]);
    this.form = formBuilder.group({
      script: this.script,
      rank: this.rank,
      dscKey: this.dscKey,
      typologies: this.typologies,
      colors: this.colors,
      ranges: this.ranges,
      chronotope: this.chronotope,
      images: this.images,
    });
  }

  ngOnInit(): void {
    if (this._instance) {
      this.updateForm(this._instance);
    }
  }

  private updateForm(model: CodHandInstance | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.script.setValue(model.script);
    this.rank.setValue(model.rank);
    this.dscKey.setValue(model.descriptionKey);
    this.initialTypologies = model.typologies || [];
    this.initialColors = model.colors || [];
    this.initialRanges = model.ranges || [];
    this.initialChronotope = model.chronotope;
    this.initialImages = model.images || [];
    this.form.markAsPristine();
  }

  private getModel(): CodHandInstance {
    return {
      script: this.script.value?.trim(),
      rank: this.rank.value ? +this.rank.value : 0,
      descriptionKey: this.dscKey.value,
      typologies: this.typologies.value || [],
      colors: this.colors.value?.length ? this.colors.value : undefined,
      ranges: this.ranges.value || [],
      chronotope: this.chronotope.value,
      images: this.images.value?.length ? this.images.value : undefined,
    };
  }

  public onTypologiesChange(ids: string[]): void {
    this.typologies.setValue(ids);
    this.typologies.markAsDirty();
  }

  public onColorsChange(ids: string[]): void {
    this.colors.setValue(ids);
    this.typologies.markAsDirty();
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges);
    this.ranges.markAsDirty();
  }

  public onChronotopeChange(chronotope: AssertedChronotope) {
    this.chronotope.setValue(chronotope);
    this.chronotope.markAsDirty();
  }

  public onImagesChange(images: CodImage[] | undefined): void {
    this.images.setValue(images);
    this.images.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.instanceChange.emit(this.getModel());
  }
}

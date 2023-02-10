import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { CodImage } from '@myrmidon/cadmus-codicology-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Flag, FlagsPickerAdapter } from '@myrmidon/cadmus-ui-flags-picker';
import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';

import { CodDecorationElement } from '../cod-decorations-part';

/**
 * List of hidden fields in decoration element component.
 * This is set by examining the values of the thesaurus
 * named "cod-decoration-type-hidden" having as key the
 * element type ID (e.g. "pag-inc"), and as value a space
 * delimited list of field names. Each of these field names
 * corresponds to a property of this object.
 */
interface HiddenDecElemFields {
  flags?: boolean;
  typologies?: boolean;
  subject?: boolean;
  colors?: boolean;
  gildings?: boolean;
  techniques?: boolean;
  tools?: boolean;
  positions?: boolean;
  lineHeight?: boolean;
  textRelation?: boolean;
}

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-decoration-element',
  templateUrl: './cod-decoration-element.component.html',
  styleUrls: ['./cod-decoration-element.component.css'],
})
export class CodDecorationElementComponent implements OnInit {
  private readonly _flagAdapter: FlagsPickerAdapter;
  private _element: CodDecorationElement | undefined;
  private _elemFlagEntries: ThesaurusEntry[];
  private _elemColorEntries: ThesaurusEntry[];
  private _elemGildingEntries: ThesaurusEntry[];
  private _elemTechEntries: ThesaurusEntry[];
  private _elemPosEntries: ThesaurusEntry[];
  private _elemToolEntries: ThesaurusEntry[];
  private _elemTypolEntries: ThesaurusEntry[];
  private _updatingForm?: boolean;
  private _adjustingUI?: boolean;

  @ViewChild('dsceditor', { static: false }) dscEditor: any;
  public editorOptions = {
    theme: 'vs-light',
    language: 'markdown',
    wordWrap: 'on',
    // https://github.com/atularen/ngx-monaco-editor/issues/19
    automaticLayout: true,
  };

  @Input()
  public get element(): CodDecorationElement | undefined {
    return this._element;
  }
  public set element(value: CodDecorationElement | undefined) {
    if (this._element === value) {
      return;
    }
    console.log('setting element');
    this._element = value;
    this.updateForm(value);
  }

  @Input()
  public parentKeys: string[] | undefined;

  @Output()
  public elementChange: EventEmitter<CodDecorationElement>;
  @Output()
  public editorClose: EventEmitter<any>;

  // general
  public key: FormControl<string | null>;
  public parentKey: FormControl<string | null>;
  public type: FormControl<string | null>;
  public flags: FormControl<Flag[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public instanceCount: FormControl<number>;
  // typologies
  public typologies: FormControl<Flag[]>;
  public subject: FormControl<string | null>;
  public colors: FormControl<Flag[]>;
  public gildings: FormControl<Flag[]>;
  public techniques: FormControl<Flag[]>;
  public tools: FormControl<Flag[]>;
  public positions: FormControl<Flag[]>;
  public lineHeight: FormControl<number>;
  public textRelation: FormControl<string | null>;
  // description
  public description: FormControl<string | null>;
  public images: FormControl<CodImage[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  // flags
  public flags$: Observable<Flag[]>;
  public typologyFlags$: Observable<Flag[]>;
  public colorFlags$: Observable<Flag[]>;
  public gildingFlags$: Observable<Flag[]>;
  public techniqueFlags$: Observable<Flag[]>;
  public toolFlags$: Observable<Flag[]>;
  public positionFlags$: Observable<Flag[]>;

  // cod-decoration-element-types (required). All the other thesauri
  // (except decTypeHiddenEntries) have their entries filtered
  // by the value selected from this thesaurus.
  @Input()
  public decElemTypeEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-type-hidden
  @Input()
  public decTypeHiddenEntries: ThesaurusEntry[] | undefined;

  // cod-decoration-element-flags
  @Input()
  public get decElemFlagEntries(): ThesaurusEntry[] | undefined {
    return this._elemFlagEntries;
  }
  public set decElemFlagEntries(value: ThesaurusEntry[] | undefined) {
    if (this._elemFlagEntries === value) {
      return;
    }
    this._elemFlagEntries = value || [];
    // this._flagAdapter.setSlotFlags(
    //   'flags',
    //   this._elemFlagEntries.map(entryToFlag)
    // );
  }

  // cod-decoration-element-colors
  @Input()
  public get decElemColorEntries(): ThesaurusEntry[] | undefined {
    return this._elemColorEntries;
  }
  public set decElemColorEntries(value: ThesaurusEntry[] | undefined) {
    if (this._elemColorEntries === value) {
      return;
    }
    this._elemColorEntries = value || [];
    // this._flagAdapter.setSlotFlags(
    //   'colors',
    //   this._elemColorEntries.map(entryToFlag)
    // );
  }

  // cod-decoration-element-gildings
  @Input()
  public get decElemGildingEntries(): ThesaurusEntry[] | undefined {
    return this._elemGildingEntries;
  }
  public set decElemGildingEntries(value: ThesaurusEntry[] | undefined) {
    if (this._elemGildingEntries === value) {
      return;
    }
    this._elemGildingEntries = value || [];
    // this._flagAdapter.setSlotFlags(
    //   'gildings',
    //   this._elemGildingEntries.map(entryToFlag)
    // );
  }

  // cod-decoration-element-techniques
  @Input()
  public get decElemTechEntries(): ThesaurusEntry[] | undefined {
    return this._elemTechEntries;
  }
  public set decElemTechEntries(value: ThesaurusEntry[] | undefined) {
    if (this._elemTechEntries === value) {
      return;
    }
    this._elemTechEntries = value || [];
    // this._flagAdapter.setSlotFlags(
    //   'techniques',
    //   this._elemTechEntries.map(entryToFlag)
    // );
  }

  // cod-decoration-element-positions
  @Input()
  public get decElemPosEntries(): ThesaurusEntry[] | undefined {
    return this._elemPosEntries;
  }
  public set decElemPosEntries(value: ThesaurusEntry[] | undefined) {
    if (this._elemPosEntries === value) {
      return;
    }
    this._elemPosEntries = value || [];
    // this._flagAdapter.setSlotFlags(
    //   'positions',
    //   this._elemPosEntries.map(entryToFlag)
    // );
  }

  // cod-decoration-element-tools
  @Input()
  public get decElemToolEntries(): ThesaurusEntry[] | undefined {
    return this._elemToolEntries;
  }
  public set decElemToolEntries(value: ThesaurusEntry[] | undefined) {
    if (this._elemToolEntries === value) {
      return;
    }
    this._elemToolEntries = value || [];
    // this._flagAdapter.setSlotFlags(
    //   'tools',
    //   this._elemToolEntries.map(entryToFlag)
    // );
  }

  // cod-decoration-element-typologies
  @Input()
  public get decElemTypolEntries(): ThesaurusEntry[] | undefined {
    return this._elemTypolEntries;
  }
  public set decElemTypolEntries(value: ThesaurusEntry[] | undefined) {
    if (this._elemTypolEntries === value) {
      return;
    }
    this._elemTypolEntries = value || [];
    // this._flagAdapter.setSlotFlags(
    //   'typologies',
    //   this._elemTypolEntries.map(entryToFlag)
    // );
  }

  // cod-image-types
  @Input()
  public imgTypeEntries: ThesaurusEntry[] | undefined;

  // the filtered entries:
  public elemFlagEntries: ThesaurusEntry[] | undefined;
  public elemColorEntries: ThesaurusEntry[] | undefined;
  public elemGildingEntries: ThesaurusEntry[] | undefined;
  public elemTechniqueEntries: ThesaurusEntry[] | undefined;
  public elemPositionEntries: ThesaurusEntry[] | undefined;
  public elemToolEntries: ThesaurusEntry[] | undefined;
  public elemTypolEntries: ThesaurusEntry[] | undefined;

  public elemGildingFree?: boolean;
  public elemTechniqueFree?: boolean;
  public elemPositionFree?: boolean;
  public elemToolFree?: boolean;

  // this object has a property for each control
  // to be hidden, having the same name of the control
  // and value=true.
  public hidden?: HiddenDecElemFields;

  constructor(formBuilder: FormBuilder) {
    this.elementChange = new EventEmitter<CodDecorationElement>();
    this.editorClose = new EventEmitter<any>();
    // flags
    this._elemFlagEntries = [];
    this._elemColorEntries = [];
    this._elemGildingEntries = [];
    this._elemTechEntries = [];
    this._elemPosEntries = [];
    this._elemToolEntries = [];
    this._elemTypolEntries = [];
    this._flagAdapter = new FlagsPickerAdapter();
    this.flags$ = this._flagAdapter.selectFlags('flags');
    this.typologyFlags$ = this._flagAdapter.selectFlags('typologies');
    this.colorFlags$ = this._flagAdapter.selectFlags('colors');
    this.gildingFlags$ = this._flagAdapter.selectFlags('gildings');
    this.techniqueFlags$ = this._flagAdapter.selectFlags('techniques');
    this.toolFlags$ = this._flagAdapter.selectFlags('tools');
    this.positionFlags$ = this._flagAdapter.selectFlags('positions');
    // form
    this.key = formBuilder.control(null, [
      Validators.pattern('^[-a-zA-Z0-9_]+$'),
      Validators.maxLength(50),
    ]);
    this.parentKey = formBuilder.control(null, [
      Validators.pattern('^[-a-zA-Z0-9_]+$'),
      Validators.maxLength(50),
    ]);
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.flags = formBuilder.control([], { nonNullable: true });
    this.ranges = formBuilder.control([], { nonNullable: true });
    this.instanceCount = formBuilder.control(0, { nonNullable: true });
    this.typologies = formBuilder.control([], { nonNullable: true });
    this.subject = formBuilder.control(null, Validators.maxLength(100));
    this.colors = formBuilder.control([], { nonNullable: true });
    this.gildings = formBuilder.control([], { nonNullable: true });
    this.techniques = formBuilder.control([], { nonNullable: true });
    this.tools = formBuilder.control([], { nonNullable: true });
    this.positions = formBuilder.control([], { nonNullable: true });
    this.lineHeight = formBuilder.control(0, {
      validators: Validators.min(0),
      nonNullable: true,
    });
    this.textRelation = formBuilder.control(null, Validators.maxLength(100));
    this.description = formBuilder.control(null, Validators.maxLength(1000));
    this.images = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(500));
    this.form = formBuilder.group({
      key: this.key,
      parentKey: this.parentKey,
      type: this.type,
      flags: this.flags,
      instanceCount: this.instanceCount,
      ranges: this.ranges,
      typologies: this.typologies,
      subject: this.subject,
      colors: this.colors,
      gildings: this.gildings,
      techniques: this.techniques,
      tools: this.tools,
      positions: this.positions,
      lineHeight: this.lineHeight,
      textRelation: this.textRelation,
      description: this.description,
      images: this.images,
      note: this.note,
    });
  }

  /**
   * Determine if the specified thesaurus entries represent a free set.
   * This happens when we just have a single entry with a single dot
   * followed by "-".
   *
   * @param entries The thesaurus entries to test.
   * @returns True if the entries represent a free set.
   */
  private isFreeSet(entries: ThesaurusEntry[] | undefined): boolean {
    if (entries?.length !== 1) {
      return false;
    }
    const tokens = entries[0].id.split('.');
    return tokens.length === 2 && tokens[1] === '-';
  }

  private getFilteredEntries(
    entries: ThesaurusEntry[] | undefined | null,
    prefix: string | null
  ): ThesaurusEntry[] | undefined {
    if (!prefix || !entries?.some((e) => e.id.indexOf('.') > -1)) {
      return entries ? [...entries] : undefined;
    }
    const p = prefix + '.';
    return entries.filter((e) => e.id.startsWith(p));
  }

  private updateVisibility(): void {
    const hidden: any = {};
    const entry = this.decTypeHiddenEntries?.find(
      (e) => e.id === this.type.value
    );
    if (entry) {
      const names = entry.value.split(' ').filter((s) => s);
      names.forEach((n) => {
        hidden[n] = true;
      });
    }
    this.hidden = hidden;
    console.log('hidden: ' + JSON.stringify(this.hidden));
  }

  ngOnInit(): void {
    // this.adjustUI();

    this.type.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe((value) => {
        if (!this._adjustingUI && !this._updatingForm) {
          console.log('type value changed: ' + value);
          this.adjustUI();
        }
      });
  }

  private adjustUI(): void {
    if (this._adjustingUI) {
      return;
    }
    this._adjustingUI = true;
    console.log('adjustUI enter');
    // reset type-dependent values
    this.flags.reset();
    this.typologies.reset();
    this.subject.reset();
    this.lineHeight.reset();
    this.textRelation.reset();

    // filter entries for multiple-selections
    this._flagAdapter.setSlotFlags(
      'flags',
      this.getFilteredEntries(this._elemFlagEntries, this.type.value)?.map(
        entryToFlag
      ) || []
    );

    this._flagAdapter.setSlotFlags(
      'colors',
      this.getFilteredEntries(this._elemColorEntries, this.type.value)?.map(
        entryToFlag
      ) || []
    );

    // filter entries and set free for single-selections
    this._flagAdapter.setSlotFlags(
      'gildings',
      this.getFilteredEntries(this._elemGildingEntries, this.type.value)?.map(
        entryToFlag
      ) || []
    );
    this.elemGildingFree = this.isFreeSet(this.elemGildingEntries);

    this._flagAdapter.setSlotFlags(
      'techniques',
      this.getFilteredEntries(this._elemTechEntries, this.type.value)?.map(
        entryToFlag
      ) || []
    );
    this.elemTechniqueFree = this.isFreeSet(this.elemTechniqueEntries);

    this._flagAdapter.setSlotFlags(
      'positions',
      this.getFilteredEntries(this._elemPosEntries, this.type.value)?.map(
        entryToFlag
      ) || []
    );
    this.elemPositionFree = this.isFreeSet(this.elemPositionEntries);

    this._flagAdapter.setSlotFlags(
      'tools',
      this.getFilteredEntries(this._elemToolEntries, this.type.value)?.map(
        entryToFlag
      ) || []
    );
    this.elemToolFree = this.isFreeSet(this.elemToolEntries);

    this._flagAdapter.setSlotFlags(
      'typologies',
      this.getFilteredEntries(this._elemTypolEntries, this.type.value)?.map(
        entryToFlag
      ) || []
    );

    // visibility
    this.updateVisibility();
    this._adjustingUI = false;
    console.log('adjustUI exit');
  }

  private updateTypeDependencies(element: CodDecorationElement): void {
    console.log('updateTypeDependencies enter');
    this.key.setValue(element.key || null);
    this.parentKey.setValue(element.parentKey || null);
    this.instanceCount.setValue(element.instanceCount || 0);

    this.ranges.setValue(element.ranges);

    this._flagAdapter.setSlotChecks('flags', element.flags);

    // typologies
    this.subject.setValue(element.subject || null);

    this._flagAdapter.setSlotChecks('colors', element.colors || []);
    this._flagAdapter.setSlotChecks('typologies', element.typologies || []);
    this._flagAdapter.setSlotChecks('gildings', element.gildings || []);
    this._flagAdapter.setSlotChecks('techniques', element.techniques || []);
    this._flagAdapter.setSlotChecks('tools', element.tools || []);
    this._flagAdapter.setSlotChecks('positions', element.positions || []);

    this.lineHeight.setValue(element.lineHeight || 0);
    this.textRelation.setValue(element.textRelation || null);
    // description
    this.description.setValue(element.description || null);
    this.images.setValue(element.images || []);
    this.note.setValue(element.note || null);

    this.form.markAsPristine();
    this._updatingForm = false;
    console.log('updateTypeDependencies exit');
  }

  private updateForm(element: CodDecorationElement | undefined): void {
    this._updatingForm = true;
    console.log('updateForm enter');
    if (!element) {
      this.form.reset();
      this._updatingForm = false;
      console.log('updateForm exit');
      return;
    }
    // general
    this.type.setValue(element.type, { emitEvent: false });
    setTimeout(() => {
      // let the UI adjust itself before setting type-dependent controls
      console.log('adjust UI from updateForm');
      this.adjustUI();
      // set type-dependent controls
      setTimeout(() => {
        this.updateTypeDependencies(element);
      });
    });

    // set other controls
    console.log('updateForm exit');
  }

  private getElement(): CodDecorationElement {
    return {
      key: this.key.value?.trim(),
      parentKey: this.parentKey.value?.trim(),
      type: this.type.value?.trim() || '',
      flags: this.flags.value.filter((f) => f.checked).map((f) => f.id) || [],
      ranges: this.ranges.value || [],
      instanceCount: this.instanceCount.value || 0,
      typologies: this.typologies.value?.length
        ? this.typologies.value.filter((f) => f.checked).map((f) => f.id) || []
        : undefined,
      subject: this.subject.value?.trim(),
      colors: this.colors.value?.length
        ? this.colors.value.filter((f) => f.checked).map((f) => f.id) || []
        : undefined,
      gildings: this.gildings.value?.length
        ? this.gildings.value.filter((f) => f.checked).map((f) => f.id) || []
        : undefined,
      techniques: this.techniques.value?.length
        ? this.techniques.value.filter((f) => f.checked).map((f) => f.id) || []
        : undefined,
      tools: this.tools.value?.length
        ? this.tools.value.filter((f) => f.checked).map((f) => f.id) || []
        : undefined,
      positions: this.positions.value?.length
        ? this.positions.value.filter((f) => f.checked).map((f) => f.id) || []
        : undefined,
      lineHeight: this.lineHeight.value,
      textRelation: this.textRelation.value?.trim(),
      description: this.description.value?.trim(),
      images: this.images.value?.length ? this.images.value : undefined,
      note: this.note.value?.trim(),
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onImagesChange(images: CodImage[] | undefined): void {
    this.images.setValue(images || []);
    this.images.updateValueAndValidity();
    this.images.markAsDirty();
  }

  public onFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('flags', flags, true);
    if (this._updatingForm) {
      return;
    }
    this.flags.setValue(flags);
    this.flags.updateValueAndValidity();
    this.flags.markAsDirty();
  }

  public onTypologyFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('typologies', flags, true);
    if (this._updatingForm) {
      return;
    }
    this.typologies.setValue(flags);
    this.typologies.updateValueAndValidity();
    this.typologies.markAsDirty();
  }

  public onColorFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('colors', flags, true);
    if (this._updatingForm) {
      return;
    }
    this.colors.setValue(flags);
    this.colors.updateValueAndValidity();
    this.colors.markAsDirty();
  }

  public onGildingFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('gildings', flags, true);
    if (this._updatingForm) {
      return;
    }
    this.gildings.setValue(flags);
    this.gildings.updateValueAndValidity();
    this.gildings.markAsDirty();
  }

  public onTechniqueFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('techniques', flags, true);
    if (this._updatingForm) {
      return;
    }
    this.techniques.setValue(flags);
    this.techniques.updateValueAndValidity();
    this.techniques.markAsDirty();
  }

  public onToolFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('tools', flags, true);
    if (this._updatingForm) {
      return;
    }
    this.tools.setValue(flags);
    this.tools.updateValueAndValidity();
    this.tools.markAsDirty();
  }

  public onPositionFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('positions', flags, true);
    if (this._updatingForm) {
      return;
    }
    this.positions.setValue(flags);
    this.positions.updateValueAndValidity();
    this.positions.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._element = this.getElement();
    this.elementChange.emit(this._element);
  }
}

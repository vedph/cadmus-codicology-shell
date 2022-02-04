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
import {
  CodLocationParser,
  CodLocationRange,
  COD_LOCATION_RANGES_PATTERN,
} from '@myrmidon/cadmus-cod-location';
import { CodImage } from '@myrmidon/cadmus-codicology-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Flag } from '@myrmidon/cadmus-ui-flags-picker';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { CodDecorationElement } from '../cod-decorations-part';

@Component({
  selector: 'cadmus-cod-decoration-element',
  templateUrl: './cod-decoration-element.component.html',
  styleUrls: ['./cod-decoration-element.component.css'],
})
export class CodDecorationElementComponent implements OnInit {
  private _element: CodDecorationElement | undefined;
  private _elemFlagEntries: ThesaurusEntry[] | undefined;
  private _elemColorEntries: ThesaurusEntry[] | undefined;
  private _elemGildingEntries: ThesaurusEntry[] | undefined;
  private _elemTechEntries: ThesaurusEntry[] | undefined;
  private _elemPosEntries: ThesaurusEntry[] | undefined;
  private _elemToolEntries: ThesaurusEntry[] | undefined;
  private _elemTypolEntries: ThesaurusEntry[] | undefined;

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
  public key: FormControl;
  public parentKey: FormControl;
  public type: FormControl;
  public flags: FormControl;
  public ranges: FormControl;
  public instanceCount: FormControl;
  // typologies
  public typologies: FormControl;
  public subject: FormControl;
  public colors: FormControl;
  public gildings: FormControl;
  public techniques: FormControl;
  public tools: FormControl;
  public positions: FormControl;
  public lineHeight: FormControl;
  public textRelation: FormControl;
  // description
  public description: FormControl;
  public images: FormControl;
  public note: FormControl;
  public form: FormGroup;

  public initialRanges: CodLocationRange[];
  public initialImages: CodImage[];
  // flags
  public initialFlags: string[];
  public initialTypologies: string[];
  public initialColors: string[];
  public initialGildings: string[];
  public initialTechniques: string[];
  public initialTools: string[];
  public initialPositions: string[];

  public availFlags: Flag[];
  public availTypologies: Flag[];
  public availColors: Flag[];
  public availGildings: Flag[];
  public availTechniques: Flag[];
  public availTools: Flag[];
  public availPositions: Flag[];

  // ms-decoration-elem-types (required). All the other thesauri
  // (except decTypeHiddenEntries) have their entries filtered
  // by the value selected from this thesaurus.
  @Input()
  public decElemTypeEntries: ThesaurusEntry[] | undefined;
  // ms-decoration-type-hidden
  @Input()
  public decTypeHiddenEntries: ThesaurusEntry[] | undefined;

  // ms-decoration-elem-flags
  @Input()
  public get decElemFlagEntries(): ThesaurusEntry[] | undefined {
    return this._elemFlagEntries;
  }
  public set decElemFlagEntries(value: ThesaurusEntry[] | undefined) {
    this._elemFlagEntries = value;
    this.elemFlagEntries = this.getFilteredEntries(value, this.type?.value);
  }

  // ms-decoration-elem-colors
  @Input()
  public get decElemColorEntries(): ThesaurusEntry[] | undefined {
    return this._elemColorEntries;
  }
  public set decElemColorEntries(value: ThesaurusEntry[] | undefined) {
    this._elemColorEntries = value;
    this.elemColorEntries = this.getFilteredEntries(value, this.type?.value);
  }

  // ms-decoration-elem-gildings
  @Input()
  public get decElemGildingEntries(): ThesaurusEntry[] | undefined {
    return this._elemGildingEntries;
  }
  public set decElemGildingEntries(value: ThesaurusEntry[] | undefined) {
    this._elemGildingEntries = value;
    this.elemGildingEntries = this.getFilteredEntries(value, this.type?.value);
  }

  // ms-decoration-elem-techniques
  @Input()
  public get decElemTechEntries(): ThesaurusEntry[] | undefined {
    return this._elemTechEntries;
  }
  public set decElemTechEntries(value: ThesaurusEntry[] | undefined) {
    this._elemTechEntries = value;
    this.elemTechniqueEntries = this.getFilteredEntries(
      value,
      this.type?.value
    );
  }

  // ms-decoration-elem-positions
  @Input()
  public get decElemPosEntries(): ThesaurusEntry[] | undefined {
    return this._elemPosEntries;
  }
  public set decElemPosEntries(value: ThesaurusEntry[] | undefined) {
    this._elemPosEntries = value;
    this.elemPositionEntries = this.getFilteredEntries(value, this.type?.value);
  }

  // ms-decoration-elem-tools
  @Input()
  public get decElemToolEntries(): ThesaurusEntry[] | undefined {
    return this._elemToolEntries;
  }
  public set decElemToolEntries(value: ThesaurusEntry[] | undefined) {
    this._elemToolEntries = value;
    this.elemToolEntries = this.getFilteredEntries(value, this.type?.value);
  }

  // ms-decoration-elem-typologies
  @Input()
  public get decElemTypolEntries(): ThesaurusEntry[] | undefined {
    return this._elemTypolEntries;
  }
  public set decElemTypolEntries(value: ThesaurusEntry[] | undefined) {
    this._elemTypolEntries = value;
    this.elemTypolEntries = this.getFilteredEntries(value, this.type?.value);
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

  // TODO: determine if these are still required; currently
  // the free feature is not implemented because controls
  // were changed from single to multiple value
  public elemGildingFree: boolean | undefined;
  public elemTechniqueFree: boolean | undefined;
  public elemPositionFree: boolean | undefined;
  public elemToolFree: boolean | undefined;

  // this object has a property for each control
  // to be hidden, having the same name of the control
  // and value=true. Names you can use are: flags,
  // typologies, subject, colors, gilding, technique,
  // tool, position, lineHeight, textRelation.
  public hidden: { [key: string]: boolean } | undefined;

  constructor(formBuilder: FormBuilder) {
    this.elementChange = new EventEmitter<CodDecorationElement>();
    this.editorClose = new EventEmitter<any>();

    this.initialRanges = [];
    this.initialImages = [];
    // flags
    this.initialFlags = [];
    this.initialTypologies = [];
    this.initialColors = [];
    this.initialGildings = [];
    this.initialTechniques = [];
    this.initialTools = [];
    this.initialPositions = [];
    this.availFlags = [];
    this.availTypologies = [];
    this.availColors = [];
    this.availGildings = [];
    this.availTechniques = [];
    this.availTools = [];
    this.availPositions = [];

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
    this.flags = formBuilder.control([]);
    this.ranges = formBuilder.control([]);
    this.instanceCount = formBuilder.control(0);
    this.typologies = formBuilder.control([]);
    this.subject = formBuilder.control(null, Validators.maxLength(100));
    this.colors = formBuilder.control([]);
    this.gildings = formBuilder.control([]);
    this.techniques = formBuilder.control([]);
    this.tools = formBuilder.control([]);
    this.positions = formBuilder.control([]);
    this.lineHeight = formBuilder.control(0, Validators.min(0));
    this.textRelation = formBuilder.control(null, Validators.maxLength(100));
    this.description = formBuilder.control(null, Validators.maxLength(1000));
    this.images = formBuilder.control([]);
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
    entries: ThesaurusEntry[] | undefined,
    prefix: string
  ): ThesaurusEntry[] | undefined {
    if (!prefix || !entries?.some((e) => e.id.indexOf('.') > -1)) {
      return entries;
    }
    const p = prefix + '.';
    return entries.filter((e) => e.id.startsWith(p));
  }

  private updateVisibility(): void {
    const hidden: { [key: string]: boolean } = {};
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
  }

  ngOnInit(): void {
    if (this._element) {
      this.updateForm(this._element);
    }
    this.onTabIndexChanged(0);

    // filter thesauri according to element's type
    this.type.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe(() => {
        // reset type-dependent values
        this.flags.reset();
        this.typologies.reset();
        this.subject.reset();
        this.initialColors = [];
        this.initialGildings = [];
        this.initialTechniques = [];
        this.initialTools = [];
        this.initialPositions = [];
        this.lineHeight.reset();
        this.textRelation.reset();

        // filter entries for multiple-selections
        this.elemFlagEntries = this.getFilteredEntries(
          this._elemFlagEntries,
          this.type?.value
        );
        this.elemColorEntries = this.getFilteredEntries(
          this._elemColorEntries,
          this.type?.value
        );

        // filter entries and set free for single-selections
        this.elemGildingEntries = this.getFilteredEntries(
          this._elemGildingEntries,
          this.type?.value
        );
        this.elemGildingFree = this.isFreeSet(this.elemGildingEntries);

        this.elemTechniqueEntries = this.getFilteredEntries(
          this._elemTechEntries,
          this.type?.value
        );
        this.elemTechniqueFree = this.isFreeSet(this.elemTechniqueEntries);

        this.elemPositionEntries = this.getFilteredEntries(
          this._elemPosEntries,
          this.type?.value
        );
        this.elemPositionFree = this.isFreeSet(this.elemPositionEntries);

        this.elemToolEntries = this.getFilteredEntries(
          this._elemToolEntries,
          this.type?.value
        );
        this.elemToolFree = this.isFreeSet(this.elemToolEntries);

        this.elemTypolEntries = this.getFilteredEntries(
          this._elemTypolEntries,
          this.type?.value
        );

        // visibility
        this.updateVisibility();
      });
  }

  public onTabIndexChanged(index: number): void {
    // HACK
    // https://github.com/atularen/ngx-monaco-editor/issues/19
    // https://stackoverflow.com/questions/37412950/ngx-monaco-editor-unable-to-set-layout-size-when-container-changes-using-tab
    if (index === 2) {
      setTimeout(() => {
        this.dscEditor?._editor?.layout();
      }, 150);
    }
  }

  private updateForm(element: CodDecorationElement | undefined): void {
    if (!element) {
      this.form.reset();
      return;
    }
    // general
    this.type.setValue(element.type);

    // let the UI adjust itself before setting type-dependent controls
    setTimeout(() => {
      this.key.setValue(element.key);
      this.parentKey.setValue(element.parentKey);
      this.initialRanges = element.ranges;
      this.initialFlags = element.flags;
      // typologies
      this.subject.setValue(element.subject);
      this.initialColors = element.colors || [];
      this.initialTypologies = element.typologies || [];
      this.initialGildings = element.gildings || [];
      this.initialTechniques = element.techniques || [];
      this.initialTools = element.tools || [];
      this.initialPositions = element.positions || [];
      this.lineHeight.setValue(element.lineHeight);
      this.textRelation.setValue(element.textRelation);
      // description
      this.description.setValue(element.description);
      this.initialImages = element.images || [];
      this.note.setValue(element.note);

      this.form.markAsPristine();
    }, 800);
  }

  private getElement(): CodDecorationElement {
    return {
      key: this.key.value?.trim(),
      parentKey: this.parentKey.value?.trim(),
      type: this.type.value?.trim(),
      flags: this.flags.value?.length ? this.flags.value : undefined,
      ranges: this.ranges.value || [],
      instanceCount: this.instanceCount.value || 0,
      typologies: this.typologies.value?.length
        ? this.typologies.value
        : undefined,
      subject: this.subject.value?.trim(),
      colors: this.colors.value?.length ? this.colors.value : undefined,
      gildings: this.gildings.value?.length ? this.gildings.value : undefined,
      techniques: this.techniques.value?.length
        ? this.techniques.value
        : undefined,
      tools: this.tools.value?.length ? this.tools.value : undefined,
      positions: this.positions.value?.length
        ? this.positions.value
        : undefined,
      lineHeight: this.lineHeight.value,
      textRelation: this.textRelation.value?.trim(),
      description: this.description.value?.trim(),
      images: this.images.value?.length ? this.images.value : undefined,
      note: this.note.value?.trim(),
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges ? ranges[0] : null);
    this.ranges.markAsDirty();
  }

  public onImagesChange(images: CodImage[] | undefined): void {
    this.images.setValue(images);
    this.images.markAsDirty();
  }

  public onFlagsChange(ids: string[]): void {
    this.flags.setValue(ids);
  }

  public onTypologiesChange(ids: string[]): void {
    this.typologies.setValue(ids);
  }

  public onColorsChange(ids: string[]): void {
    this.colors.setValue(ids);
  }

  public onGildingsChange(ids: string[]): void {
    this.gildings.setValue(ids);
  }

  public onTechniquesChange(ids: string[]): void {
    this.techniques.setValue(ids);
  }

  public onToolsChange(ids: string[]): void {
    this.tools.setValue(ids);
  }

  public onPositionsChange(ids: string[]): void {
    this.positions.setValue(ids);
  }

  // TODO: replace with generic pipe
  public typeIdToString(id: string): string {
    const entry = this.decElemTypeEntries?.find((e) => e.id === id);
    return entry ? entry.value : id;
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    const element = this.getElement();
    this.elementChange.emit(element);
  }
}

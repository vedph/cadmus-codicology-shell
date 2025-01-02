import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { NgeMonacoModule } from '@cisstech/nge/monaco';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { FlatLookupPipe } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { CodImage, CodImagesComponent } from '@myrmidon/cadmus-codicology-ui';

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
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatTabGroup,
    MatTab,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    CodLocationComponent,
    FlagSetComponent,
    NgeMonacoModule,
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatButton,
    FlatLookupPipe,
    CodImagesComponent,
  ],
})
export class CodDecorationElementComponent implements OnInit, OnDestroy {
  // monaco
  private readonly _disposables: monaco.IDisposable[] = [];
  private _editorModel?: monaco.editor.ITextModel;
  private _editor?: monaco.editor.IStandaloneCodeEditor;

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
  public flags: FormControl<string[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public instanceCount: FormControl<number>;
  // typologies
  public typologies: FormControl<string[]>;
  public subject: FormControl<string | null>;
  public colors: FormControl<string[]>;
  public gildings: FormControl<string[]>;
  public techniques: FormControl<string[]>;
  public tools: FormControl<string[]>;
  public positions: FormControl<string[]>;
  public lineHeight: FormControl<number>;
  public textRelation: FormControl<string | null>;
  // description
  public description: FormControl<string | null>;
  public images: FormControl<CodImage[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  // flags
  public genFlags: Flag[] = [];
  public typologyFlags: Flag[] = [];
  public colorFlags: Flag[] = [];
  public gildingFlags: Flag[] = [];
  public techniqueFlags: Flag[] = [];
  public toolFlags: Flag[] = [];
  public positionFlags: Flag[] = [];

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
    this.genFlags = this._elemFlagEntries.map(entryToFlag) || [];
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
    this.colorFlags = this._elemColorEntries.map(entryToFlag) || [];
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
    this.gildingFlags = this._elemGildingEntries.map(entryToFlag) || [];
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
    this.techniqueFlags = this._elemTechEntries.map(entryToFlag) || [];
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
    this.positionFlags = this._elemPosEntries.map(entryToFlag) || [];
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
    this.toolFlags = this._elemToolEntries.map(entryToFlag) || [];
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
    this.typologyFlags = this._elemTypolEntries.map(entryToFlag) || [];
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

  public ngOnInit(): void {
    this.type.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe((value) => {
        if (!this._adjustingUI && !this._updatingForm) {
          console.log('type value changed: ' + value);
          this.adjustUI();
        }
      });
  }

  public ngOnDestroy() {
    this._disposables.forEach((d) => d.dispose());
  }

  public onCreateEditor(editor: monaco.editor.IEditor) {
    editor.updateOptions({
      minimap: {
        side: 'right',
      },
      wordWrap: 'on',
      automaticLayout: true,
    });
    this._editorModel =
      this._editorModel || monaco.editor.createModel('', 'markdown');
    editor.setModel(this._editorModel);
    this._editor = editor as monaco.editor.IStandaloneCodeEditor;

    this._disposables.push(
      this._editorModel.onDidChangeContent((e) => {
        this.description.setValue(this._editorModel!.getValue());
        this.description.markAsDirty();
        this.description.updateValueAndValidity();
      })
    );
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
    this.flags.setValue(
      (
        this.getFilteredEntries(this._elemFlagEntries, this.type.value)?.map(
          entryToFlag
        ) || []
      ).map((f) => f.id)
    );

    this.colors.setValue(
      (
        this.getFilteredEntries(this._elemColorEntries, this.type.value)?.map(
          entryToFlag
        ) || []
      ).map((f) => f.id)
    );

    // filter entries and set free for single-entry groups with "any.-"
    let entries = this.getFilteredEntries(
      this._elemGildingEntries,
      this.type.value
    );
    this.elemGildingFree = this.isFreeSet(entries);
    this.gildings.setValue(
      this.elemGildingFree
        ? []
        : (entries?.map(entryToFlag) || []).map((f) => f.id)
    );

    entries = this.getFilteredEntries(this._elemTechEntries, this.type.value);
    this.elemTechniqueFree = this.isFreeSet(entries);
    this.techniques.setValue(
      this.elemTechniqueFree
        ? []
        : (entries?.map(entryToFlag) || []).map((f) => f.id)
    );

    entries = this.getFilteredEntries(this._elemPosEntries, this.type.value);
    this.elemPositionFree = this.isFreeSet(entries);
    this.positions.setValue(
      this.elemPositionFree
        ? []
        : (entries?.map(entryToFlag) || []).map((f) => f.id)
    );

    entries = this.getFilteredEntries(this._elemToolEntries, this.type.value);
    this.elemToolFree = this.isFreeSet(entries);
    this.tools.setValue(
      this.elemToolFree
        ? []
        : (entries?.map(entryToFlag) || []).map((f) => f.id)
    );

    this.typologies.setValue(
      (
        this.getFilteredEntries(this._elemTypolEntries, this.type.value)?.map(
          entryToFlag
        ) || []
      ).map((f) => f.id)
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

    this.flags.setValue(element.flags || []);

    // typologies
    this.subject.setValue(element.subject || null);
    // colors
    this.colors.setValue(element.colors || []);
    // typologies
    this.typologies.setValue(element.typologies || []);
    // gildings
    this.gildings.setValue(element.gildings || []);
    // techniques
    this.techniques.setValue(element.techniques || []);
    // tools
    this.tools.setValue(element.tools || []);
    // positions
    this.positions.setValue(element.positions || []);

    this.lineHeight.setValue(element.lineHeight || 0);
    this.textRelation.setValue(element.textRelation || null);
    // description
    this.description.setValue(element.description || null);
    this._editorModel?.setValue(element.description || '');
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
      flags: this.flags.value,
      ranges: this.ranges.value || [],
      instanceCount: this.instanceCount.value || 0,
      typologies: this.typologies.value,
      subject: this.subject.value?.trim(),
      colors: this.colors.value,
      gildings: this.gildings.value,
      techniques: this.techniques.value,
      tools: this.tools.value,
      positions: this.positions.value,
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

  public onGenIdsChange(ids: string[]): void {
    if (this._updatingForm) {
      return;
    }
    this.flags.setValue(ids);
    this.flags.updateValueAndValidity();
    this.flags.markAsDirty();
  }

  public onTypologyIdsChange(ids: string[]): void {
    if (this._updatingForm) {
      return;
    }
    this.typologies.setValue(ids);
    this.typologies.updateValueAndValidity();
    this.typologies.markAsDirty();
  }

  public onColorIdsChange(ids: string[]): void {
    if (this._updatingForm) {
      return;
    }
    this.colors.setValue(ids);
    this.colors.updateValueAndValidity();
    this.colors.markAsDirty();
  }

  public onGildingIdsChange(ids: string[]): void {
    if (this._updatingForm) {
      return;
    }
    this.gildings.setValue(ids);
    this.gildings.updateValueAndValidity();
    this.gildings.markAsDirty();
  }

  public onTechniqueIdsChange(ids: string[]): void {
    if (this._updatingForm) {
      return;
    }
    this.techniques.setValue(ids);
    this.techniques.updateValueAndValidity();
    this.techniques.markAsDirty();
  }

  public onToolIdsChange(ids: string[]): void {
    if (this._updatingForm) {
      return;
    }
    this.tools.setValue(ids);
    this.tools.updateValueAndValidity();
    this.tools.markAsDirty();
  }

  public onPositionIdsChange(ids: string[]): void {
    if (this._updatingForm) {
      return;
    }
    this.positions.setValue(ids);
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

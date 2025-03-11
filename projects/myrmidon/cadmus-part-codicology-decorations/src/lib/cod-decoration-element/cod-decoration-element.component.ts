import {
  Component,
  effect,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
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

  private _updatingForm?: boolean;
  private _adjustingUI?: boolean;

  @ViewChild('dsceditor', { static: false }) dscEditor: any;

  public readonly element = model<CodDecorationElement>();

  public readonly parentKeys = input<string[]>();

  public readonly editorClose = output();

  // general
  public key: FormControl<string | null>;
  public parentKey: FormControl<string | null>;
  public type: FormControl<string | null>;
  public tag: FormControl<string | null>;
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
  public readonly decElemTypeEntries = input<ThesaurusEntry[]>();
  // cod-decoration-type-hidden
  public readonly decTypeHiddenEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-flags
  public readonly decElemFlagEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-colors
  public readonly decElemColorEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-gildings
  public readonly decElemGildingEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-techniques
  public readonly decElemTechEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-positions
  public readonly decElemPosEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-tools
  public readonly decElemToolEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-tags
  public readonly decElemTagEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-typologies
  public readonly decElemTypolEntries = input<ThesaurusEntry[]>();
  // cod-image-types
  public readonly imgTypeEntries = input<ThesaurusEntry[]>();

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
    this.tag = formBuilder.control(null, Validators.maxLength(50));
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
      tag: this.tag,
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

    effect(() => {
      this.updateForm(this.element());
    });

    effect(() => {
      this.genFlags = this.decElemFlagEntries()?.map(entryToFlag) || [];
    });

    effect(() => {
      this.colorFlags = this.decElemColorEntries()?.map(entryToFlag) || [];
    });

    effect(() => {
      this.gildingFlags = this.decElemGildingEntries()?.map(entryToFlag) || [];
    });

    effect(() => {
      this.techniqueFlags = this.decElemTechEntries()?.map(entryToFlag) || [];
    });

    effect(() => {
      this.positionFlags = this.decElemPosEntries()?.map(entryToFlag) || [];
    });

    effect(() => {
      this.toolFlags = this.decElemToolEntries()?.map(entryToFlag) || [];
    });

    effect(() => {
      this.typologyFlags = this.decElemTypolEntries()?.map(entryToFlag) || [];
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
    const entry = this.decTypeHiddenEntries()?.find(
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
        this.getFilteredEntries(
          this.decElemFlagEntries(),
          this.type.value
        )?.map(entryToFlag) || []
      ).map((f) => f.id)
    );

    this.colors.setValue(
      (
        this.getFilteredEntries(
          this.decElemColorEntries(),
          this.type.value
        )?.map(entryToFlag) || []
      ).map((f) => f.id)
    );

    // filter entries and set free for single-entry groups with "any.-"
    let entries = this.getFilteredEntries(
      this.decElemGildingEntries(),
      this.type.value
    );
    this.elemGildingFree = this.isFreeSet(entries);
    this.gildings.setValue(
      this.elemGildingFree
        ? []
        : (entries?.map(entryToFlag) || []).map((f) => f.id)
    );

    entries = this.getFilteredEntries(
      this.decElemTechEntries(),
      this.type.value
    );
    this.elemTechniqueFree = this.isFreeSet(entries);
    this.techniques.setValue(
      this.elemTechniqueFree
        ? []
        : (entries?.map(entryToFlag) || []).map((f) => f.id)
    );

    entries = this.getFilteredEntries(
      this.decElemPosEntries(),
      this.type.value
    );
    this.elemPositionFree = this.isFreeSet(entries);
    this.positions.setValue(
      this.elemPositionFree
        ? []
        : (entries?.map(entryToFlag) || []).map((f) => f.id)
    );

    entries = this.getFilteredEntries(
      this.decElemToolEntries(),
      this.type.value
    );
    this.elemToolFree = this.isFreeSet(entries);
    this.tools.setValue(
      this.elemToolFree
        ? []
        : (entries?.map(entryToFlag) || []).map((f) => f.id)
    );

    this.typologies.setValue(
      (
        this.getFilteredEntries(
          this.decElemTypolEntries(),
          this.type.value
        )?.map(entryToFlag) || []
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
    this.tag.setValue(element.tag || null, { emitEvent: false });
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
      tag: this.tag.value?.trim(),
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
    this.element.set(this.getElement());
  }
}

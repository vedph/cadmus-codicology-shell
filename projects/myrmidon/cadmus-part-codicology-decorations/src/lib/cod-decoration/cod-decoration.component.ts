import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import { Flag } from '@myrmidon/cadmus-ui-flags-picker';
import { DialogService } from '@myrmidon/ng-mat-tools';

import {
  CodDecoration,
  CodDecorationArtist,
  CodDecorationElement,
} from '../cod-decorations-part';

/**
 * Manuscript's decoration editor.
 * This component requires the cod-decoration-element-types thesaurus.
 * According to the type selected, it changes its UI by:
 * - filtering the content of all the other thesauri (except
 * cod-decoration-type-hidden, which has a special meaning),
 * when they have a hierarchy (i.e. their IDs contain a dot).
 * Such type-dependent thesauri have their entries IDs prefixed
 * with the type ID followed by dot. For instance, type "ill"
 * has some corresponding entries in a type-dependent thesaurus
 * like cod-decoration-element-types, like "ill.miniature",
 * "ill.drawing", etc.
 * Also, if the filtered content of a thesaurus happens to have
 * an entry ID equal to "-" once the type prefix has been stripped
 * out, this means that in this case the corresponding control
 * should be a free text box rather than a selector.
 * This anyway does not apply to those controls allowing multiple
 * selections, like flags or colors.
 * - hiding some controls. When a type is selected, the thesaurus
 * cod-decoration-type-hidden is looked up to find an entry
 * with ID equal to the selected type ID. If found, it is assumed
 * that its value is a space-delimited list of names of those
 * controls which should be hidden.
 * This logic is effectively implemented by
 * CodDecorationElementComponent.
 */
@Component({
  selector: 'cadmus-cod-decoration',
  templateUrl: './cod-decoration.component.html',
  styleUrls: ['./cod-decoration.component.css'],
})
export class CodDecorationComponent implements OnInit {
  private _decoration: CodDecoration | undefined;

  @Input()
  public get decoration(): CodDecoration | undefined {
    return this._decoration;
  }
  public set decoration(value: CodDecoration | undefined) {
    this._decoration = value;
    this.updateForm(value);
  }

  // cod-decoration-element-types (required)
  @Input()
  public decElemTypeEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-type-hidden
  @Input()
  public decTypeHiddenEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-flags
  @Input()
  public decElemFlagEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-colors
  @Input()
  public decElemColorEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-gildings
  @Input()
  public decElemGildingEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-techniques
  @Input()
  public decElemTechEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-positions
  @Input()
  public decElemPosEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-tools
  @Input()
  public decElemToolEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-typologies
  @Input()
  public decElemTypolEntries: ThesaurusEntry[] | undefined;
  // cod-image-types
  @Input()
  public imgTypeEntries: ThesaurusEntry[] | undefined;

  @Output()
  public decorationChange: EventEmitter<CodDecoration>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl;
  public name: FormControl;
  public flags: FormControl;
  public chronotopes: FormControl;
  public artists: FormControl;
  public note: FormControl;
  public references: FormControl;
  public elements: FormControl;
  public form: FormGroup;

  public initialChronotopes: AssertedChronotope[];
  public initialReferences: DocReference[];
  public initialFlags: string[];
  public availFlags: Flag[];

  public editedElementIndex: number;
  public editedElement: CodDecorationElement | undefined;
  public editorOptions = {
    theme: 'vs-light',
    language: 'markdown',
    wordWrap: 'on',
    // https://github.com/atularen/ngx-monaco-editor/issues/19
    automaticLayout: true,
  };

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    this.editedElementIndex = -1;
    this.decorationChange = new EventEmitter<CodDecoration>();
    this.editorClose = new EventEmitter<any>();
    this.initialChronotopes = [];
    this.initialReferences = [];
    this.initialFlags = [];
    this.availFlags = [];
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.name = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.flags = formBuilder.control([]);
    this.chronotopes = formBuilder.control([]);
    this.artists = formBuilder.control([]);
    this.note = formBuilder.control(Validators.maxLength(1000));
    this.references = formBuilder.control([]);
    this.elements = formBuilder.control([]);
    this.form = formBuilder.group({
      eid: this.eid,
      name: this.name,
      flags: this.flags,
      chronotopes: this.chronotopes,
      artists: this.artists,
      note: this.note,
      references: this.references,
      elements: this.elements,
    });
  }

  ngOnInit(): void {
    if (this._decoration) {
      this.updateForm(this._decoration);
    }
  }

  private updateForm(decoration: CodDecoration | undefined): void {
    if (!decoration) {
      this.initialChronotopes = [];
      this.initialReferences = [];
      this.initialFlags = [];
      this.form.reset();
      return;
    }

    this.initialChronotopes = decoration.chronotopes || [];
    this.initialReferences = decoration.references || [];
    this.initialFlags = decoration.flags || [];

    this.eid.setValue(decoration.eid);
    this.name.setValue(decoration.name);
    this.note.setValue(decoration.note);
    this.elements.setValue(decoration.elements || []);

    this.form.markAsPristine();
  }

  public onChronotopesChange(chronotopes: AssertedChronotope[]): void {
    this.chronotopes.setValue(chronotopes);
  }

  public onReferencesChange(references: DocReference[]): void {
    this.references.setValue(references);
  }

  public onSelectedIdsChange(ids: string[]): void {
    this.flags.setValue(ids);
  }

  private getDecoration(): CodDecoration {
    return {
      eid: this.eid.value?.trim(),
      name: this.name.value?.trim(),
      flags: this.flags.value?.length ? this.flags.value : undefined,
      chronotopes: this.chronotopes.value?.length
        ? this.chronotopes.value
        : undefined,
      artists: this.artists.value?.length ? this.artists.value : undefined,
      note: this.note.value?.trim(),
      elements: this.elements.value?.length ? this.elements.value : undefined,
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.decorationChange.emit(this.getDecoration());
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { take } from 'rxjs';

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
  private _decFlagEntries: ThesaurusEntry[] | undefined;

  @Input()
  public get decoration(): CodDecoration | undefined {
    return this._decoration;
  }
  public set decoration(value: CodDecoration | undefined) {
    if (this._decoration === value) {
      return;
    }
    this._decoration = value;
    this.updateForm(value);
  }

  // cod-decoration-element-flags
  @Input()
  public decElemFlagEntries: ThesaurusEntry[] | undefined;

  // cod-decoration-flags
  @Input()
  public get decFlagEntries(): ThesaurusEntry[] | undefined {
    return this._decFlagEntries;
  }
  public set decFlagEntries(value: ThesaurusEntry[] | undefined) {
    this._decFlagEntries = value;
    this.availFlags = value?.length
      ? value.map((e) => {
          return {
            id: e.id,
            label: e.value,
          } as Flag;
        })
      : [];
  }

  // cod-decoration-element-types (required)
  @Input()
  public decElemTypeEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-type-hidden
  @Input()
  public decTypeHiddenEntries: ThesaurusEntry[] | undefined;
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
  // cod-decoration-artist-types
  @Input()
  public artTypeEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-artist-style-names
  @Input()
  public artStyleEntries: ThesaurusEntry[] | undefined;
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
  // external-id-tags
  @Input()
  public idTagEntries: ThesaurusEntry[] | undefined;
  // external-id-scopes
  @Input()
  public idScopeEntries: ThesaurusEntry[] | undefined;

  @Output()
  public decorationChange: EventEmitter<CodDecoration>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl<string | null>;
  public name: FormControl<string | null>;
  public flags: FormControl<string[]>;
  public chronotopes: FormControl<AssertedChronotope[]>;
  public artists: FormControl<CodDecorationArtist[]>;
  public note: FormControl<string | null>;
  public references: FormControl<DocReference[]>;
  public elements: FormControl<CodDecorationElement[]>;
  public form: FormGroup;

  public initialFlags: string[];
  public availFlags: Flag[];

  public editedElementIndex: number;
  public editedElement: CodDecorationElement | undefined;
  public parentKeys: string[];

  public editedArtistIndex: number;
  public editedArtist?: CodDecorationArtist;

  public editorOptions = {
    theme: 'vs-light',
    language: 'markdown',
    wordWrap: 'on',
    // https://github.com/atularen/ngx-monaco-editor/issues/19
    automaticLayout: true,
  };

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    this.editedElementIndex = -1;
    this.parentKeys = [];
    this.editedArtistIndex = -1;
    this.decorationChange = new EventEmitter<CodDecoration>();
    this.editorClose = new EventEmitter<any>();
    this.initialFlags = [];
    this.availFlags = [];
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.name = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.flags = formBuilder.control([], { nonNullable: true });
    this.chronotopes = formBuilder.control([], { nonNullable: true });
    this.artists = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.references = formBuilder.control([], { nonNullable: true });
    this.elements = formBuilder.control([], { nonNullable: true });
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
      this.initialFlags = [];
      this.form.reset();
      return;
    }

    this.chronotopes.setValue(decoration.chronotopes || []);
    this.references.setValue(decoration.references || []);
    this.initialFlags = decoration.flags || [];

    this.eid.setValue(decoration.eid || null);
    this.name.setValue(decoration.name);
    this.note.setValue(decoration.note || null);
    this.artists.setValue(decoration.artists || []);
    this.elements.setValue(decoration.elements || []);
    this.updateParentKeys();

    this.form.markAsPristine();
  }

  public onChronotopesChange(chronotopes: AssertedChronotope[]): void {
    this.chronotopes.setValue(chronotopes);
    this.chronotopes.updateValueAndValidity();
    this.chronotopes.markAsDirty();
  }

  public onReferencesChange(references: DocReference[]): void {
    this.references.setValue(references);
    this.references.updateValueAndValidity();
    this.references.markAsDirty();
  }

  public onSelectedIdsChange(ids: string[]): void {
    this.flags.setValue(ids);
    this.flags.updateValueAndValidity();
    this.flags.markAsDirty();
  }

  private getDecoration(): CodDecoration {
    return {
      eid: this.eid.value?.trim(),
      name: this.name.value?.trim() || '',
      flags: this.flags.value?.length ? this.flags.value : undefined,
      chronotopes: this.chronotopes.value?.length
        ? this.chronotopes.value
        : undefined,
      references: this.references.value?.length
        ? this.references.value
        : undefined,
      artists: this.artists.value?.length ? this.artists.value : undefined,
      note: this.note.value?.trim(),
      elements: this.elements.value?.length ? this.elements.value : undefined,
    };
  }

  //#region elements
  public addElement(): void {
    this.editElement({
      type: this.decElemTypeEntries?.length
        ? this.decElemTypeEntries[0].id
        : '',
      flags: [],
      ranges: [],
    });
  }

  public editElement(element: CodDecorationElement | null, index = -1): void {
    if (!element) {
      this.editedElementIndex = -1;
      this.editedElement = undefined;
    } else {
      this.editedElementIndex = index;
      this.editedElement = element;
    }
  }

  private updateParentKeys(): void {
    if (!this.elements.value?.length) {
      this.parentKeys = [];
      return;
    }
    let keys: string[] = this.elements.value.map(
      (e: CodDecorationElement) => e.key!
    );
    this.parentKeys = [...new Set(keys)].sort();
  }

  public onElementSave(element: CodDecorationElement): void {
    const elements = [...this.elements.value];

    if (this.editedElementIndex > -1) {
      elements.splice(this.editedElementIndex, 1, element);
    } else {
      elements.push(element);
    }

    this.elements.setValue(elements);
    this.elements.updateValueAndValidity();
    this.elements.markAsDirty();
    this.editElement(null);
    this.updateParentKeys();
  }

  public removeElement(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete element?')
      .pipe(take(1))
      .subscribe((yes: boolean) => {
        if (yes) {
          const items = [...this.elements.value];
          items.splice(index, 1);
          this.elements.setValue(items);
          this.elements.updateValueAndValidity();
          this.elements.markAsDirty();
          this.updateParentKeys();
        }
      });
  }

  public moveElementUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.elements.value[index];
    const items = [...this.elements.value];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.elements.setValue(items);
    this.elements.updateValueAndValidity();
    this.elements.markAsDirty();
  }

  public moveElementDown(index: number): void {
    if (index + 1 >= this.elements.value.length) {
      return;
    }
    const item = this.elements.value[index];
    const items = [...this.elements.value];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.elements.setValue(items);
    this.elements.updateValueAndValidity();
    this.elements.markAsDirty();
  }
  //#endregion

  //#region artists
  public addArtist(): void {
    this.editArtist({
      type: this.artTypeEntries?.length ? this.artTypeEntries[0].id : '',
      name: '',
    });
  }

  public editArtist(artist: CodDecorationArtist | null, index = -1): void {
    if (!artist) {
      this.editedArtistIndex = -1;
      this.editedArtist = undefined;
    } else {
      this.editedArtistIndex = index;
      this.editedArtist = artist;
    }
  }

  public onArtistSave(artist: CodDecorationArtist): void {
    const artists = [...this.artists.value];

    if (this.editedArtistIndex > -1) {
      artists.splice(this.editedArtistIndex, 1, artist);
    } else {
      artists.push(artist);
    }

    this.artists.setValue(artists);
    this.artists.updateValueAndValidity();
    this.artists.markAsDirty();
    this.editArtist(null);
  }

  public removeArtist(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete artist?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const items = [...this.artists.value];
          items.splice(index, 1);
          this.artists.setValue(items);
          this.artists.updateValueAndValidity();
          this.artists.markAsDirty();
        }
      });
  }

  public moveArtistUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.artists.value[index];
    const items = [...this.artists.value];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.artists.setValue(items);
    this.artists.updateValueAndValidity();
    this.artists.markAsDirty();
  }

  public moveArtistDown(index: number): void {
    if (index + 1 >= this.artists.value.length) {
      return;
    }
    const item = this.artists.value[index];
    const items = [...this.artists.value];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.artists.setValue(items);
    this.artists.updateValueAndValidity();
    this.artists.markAsDirty();
  }
  //#endregion

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._decoration = this.getDecoration();
    this.decorationChange.emit(this._decoration);
  }
}

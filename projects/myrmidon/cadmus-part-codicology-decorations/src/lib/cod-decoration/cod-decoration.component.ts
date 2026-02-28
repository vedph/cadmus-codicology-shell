import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { take } from 'rxjs';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { deepCopy, FlatLookupPipe } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  AssertedChronotope,
  AssertedChronotopeSetComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import {
  LookupDocReferencesComponent,
  LookupProviderOptions,
} from '@myrmidon/cadmus-refs-lookup';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodDecoration,
  CodDecorationArtist,
  CodDecorationElement,
} from '../cod-decorations-part';
import { CodDecorationArtistComponent } from '../cod-decoration-artist/cod-decoration-artist.component';
import { CodDecorationElementComponent } from '../cod-decoration-element/cod-decoration-element.component';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    FlagSetComponent,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIcon,
    AssertedChronotopeSetComponent,
    LookupDocReferencesComponent,
    MatButton,
    MatIconButton,
    MatTooltip,
    CodDecorationArtistComponent,
    CodDecorationElementComponent,
    CodLocationRangePipe,
    FlatLookupPipe,
  ],
})
export class CodDecorationComponent {
  public readonly decoration = model<CodDecoration>();

  // cod-decoration-element-flags
  public readonly decElemFlagEntries = input<ThesaurusEntry[]>();

  // cod-decoration-flags
  public readonly decFlagEntries = input<ThesaurusEntry[]>();

  // cod-decoration-element-types (required)
  public readonly decElemTypeEntries = input<ThesaurusEntry[]>();
  // cod-decoration-type-hidden
  public readonly decTypeHiddenEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-colors
  public readonly decElemColorEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-gildings
  public readonly decElemGildingEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-techniques
  public readonly decElemTechEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-positions
  public readonly decElemPosEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-tags
  public readonly decElemTagEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-tools
  public readonly decElemToolEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-typologies
  public readonly decElemTypolEntries = input<ThesaurusEntry[]>();
  // cod-image-types
  public readonly imgTypeEntries = input<ThesaurusEntry[]>();
  // cod-decoration-artist-types
  public readonly artTypeEntries = input<ThesaurusEntry[]>();
  // cod-decoration-artist-style-names
  public readonly artStyleEntries = input<ThesaurusEntry[]>();
  // chronotope-tags
  public readonly ctTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // external-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // external-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public readonly editorClose = output();

  public eid: FormControl<string | null>;
  public name: FormControl<string | null>;
  public flags: FormControl<string[]>;
  public chronotopes: FormControl<AssertedChronotope[]>;
  public artists: FormControl<CodDecorationArtist[]>;
  public note: FormControl<string | null>;
  public references: FormControl<DocReference[]>;
  public elements: FormControl<CodDecorationElement[]>;
  public form: FormGroup;

  public readonly editedElementIndex = signal<number>(-1);
  public readonly editedElement = signal<CodDecorationElement | undefined>(
    undefined,
  );
  public readonly parentKeys = signal<string[]>([]);

  public readonly editedArtistIndex = signal<number>(-1);
  public readonly editedArtist = signal<CodDecorationArtist | undefined>(
    undefined,
  );

  public editorOptions = {
    theme: 'vs-light',
    language: 'markdown',
    wordWrap: 'on',
    // https://github.com/atularen/ngx-monaco-editor/issues/19
    automaticLayout: true,
  };

  // flags
  public readonly decFlags = computed<Flag[]>(() => {
    return this.decFlagEntries()?.map(entryToFlag) || [];
  });

  constructor(
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
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

    effect(() => {
      const decoration = this.decoration();
      this.updateForm(decoration);
    });
  }

  private updateForm(decoration: CodDecoration | undefined): void {
    if (!decoration) {
      this.form.reset();
      return;
    }

    this.chronotopes.setValue(decoration.chronotopes || []);
    this.references.setValue(decoration.references || []);
    this.flags.setValue(decoration.flags || []);
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

  public onFlagIdsChange(ids: string[]): void {
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
      type: this.decElemTypeEntries()?.length
        ? this.decElemTypeEntries()![0].id
        : '',
      flags: [],
      ranges: [],
    });
  }

  public editElement(element: CodDecorationElement | null, index = -1): void {
    if (!element) {
      this.editedElementIndex.set(-1);
      this.editedElement.set(undefined);
    } else {
      this.editedElementIndex.set(index);
      this.editedElement.set(deepCopy(element));
    }
  }

  private updateParentKeys(): void {
    if (!this.elements.value?.length) {
      this.parentKeys.set([]);
      return;
    }
    let keys: string[] = this.elements.value.map(
      (e: CodDecorationElement) => e.key!,
    );
    this.parentKeys.set([...new Set(keys)].sort());
  }

  public onElementSave(element: CodDecorationElement): void {
    const elements = [...this.elements.value];

    if (this.editedElementIndex() > -1) {
      elements.splice(this.editedElementIndex(), 1, element);
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
      type: this.artTypeEntries()?.length ? this.artTypeEntries()![0].id : '',
      name: '',
    });
  }

  public editArtist(artist: CodDecorationArtist | null, index = -1): void {
    if (!artist) {
      this.editedArtistIndex.set(-1);
      this.editedArtist.set(undefined);
    } else {
      this.editedArtistIndex.set(index);
      this.editedArtist.set(deepCopy(artist));
    }
  }

  public onArtistSave(artist: CodDecorationArtist): void {
    const artists = [...this.artists.value];

    if (this.editedArtistIndex() > -1) {
      artists.splice(this.editedArtistIndex(), 1, artist);
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
    this.decoration.set(this.getDecoration());
  }
}

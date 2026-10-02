import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
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

import { FlatLookupPipe } from '@myrmidon/ngx-tools';
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
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

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

interface CodDecorationControls {
  eid: string;
  name: string;
  flags: string[];
  chronotopes: AssertedChronotope[];
  artists: CodDecorationArtist[];
  note: string;
  references: DocReference[];
  elements: CodDecorationElement[];
}

function toDraft(decoration?: CodDecoration): CodDecorationControls {
  return {
    eid: decoration?.eid || '',
    name: decoration?.name || '',
    flags: [...(decoration?.flags || [])],
    chronotopes: copyFormValue(decoration?.chronotopes || []),
    artists: copyFormValue(decoration?.artists || []),
    note: decoration?.note || '',
    references: copyFormValue(decoration?.references || []),
    elements: copyFormValue(decoration?.elements || []),
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
    FormField,
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
  private readonly _dialogService = inject(DialogService);

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
  // hide artists UI
  public readonly hideArtists = input<boolean>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public readonly editorClose = output();

  private readonly _draft = linkedSignal(() => toDraft(this.decoration()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.eid, 100);
    required(p.name);
    maxLength(p.name, 50);
    maxLength(p.note, 1000);
  });

  public readonly editedElementIndex = signal<number>(-1);
  public readonly editedElement = signal<CodDecorationElement | undefined>(
    undefined,
  );
  // the distinct keys of the elements, available as parent keys
  public readonly parentKeys = computed<string[]>(() => {
    const keys = this.form
      .elements()
      .value()
      .map((e) => e.key)
      .filter((k): k is string => !!k);
    return [...new Set(keys)].sort();
  });

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

  constructor() {
    // new decoration: clear the interaction state
    effect(() => {
      this.decoration();
      untracked(() => this.form().reset());
    });
  }

  public onChronotopesChange(chronotopes: AssertedChronotope[]): void {
    setFieldFromChild(this.form.chronotopes, copyFormValue(chronotopes || []));
  }

  public onReferencesChange(references: DocReference[]): void {
    setFieldFromChild(this.form.references, copyFormValue(references || []));
  }

  public onFlagIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.flags, [...(ids || [])]);
  }

  private getDecoration(): CodDecoration {
    const draft = this._draft();
    return {
      eid: draft.eid.trim() || undefined,
      name: draft.name.trim(),
      flags: draft.flags.length ? [...draft.flags] : undefined,
      chronotopes: draft.chronotopes.length
        ? copyFormValue(draft.chronotopes)
        : undefined,
      references: draft.references.length
        ? copyFormValue(draft.references)
        : undefined,
      artists: draft.artists.length ? copyFormValue(draft.artists) : undefined,
      note: draft.note.trim() || undefined,
      elements: draft.elements.length
        ? copyFormValue(draft.elements)
        : undefined,
    };
  }

  //#region elements
  private setElements(elements: CodDecorationElement[]): void {
    this.form.elements().value.set(elements);
    this.form.elements().markAsDirty();
  }

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
      this.editedElement.set(structuredClone(element));
    }
  }

  public onElementSave(element: CodDecorationElement): void {
    const elements = [...this.form.elements().value()];

    if (this.editedElementIndex() > -1) {
      elements.splice(this.editedElementIndex(), 1, element);
    } else {
      elements.push(element);
    }

    this.setElements(elements);
    this.editElement(null);
  }

  public removeElement(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete element?')
      .pipe(take(1))
      .subscribe((yes: boolean) => {
        if (yes) {
          const items = [...this.form.elements().value()];
          items.splice(index, 1);
          this.setElements(items);
        }
      });
  }

  public moveElementUp(index: number): void {
    if (index < 1) {
      return;
    }
    const items = [...this.form.elements().value()];
    const item = items[index];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.setElements(items);
  }

  public moveElementDown(index: number): void {
    const items = [...this.form.elements().value()];
    if (index + 1 >= items.length) {
      return;
    }
    const item = items[index];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.setElements(items);
  }
  //#endregion

  //#region artists
  private setArtists(artists: CodDecorationArtist[]): void {
    this.form.artists().value.set(artists);
    this.form.artists().markAsDirty();
  }

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
      this.editedArtist.set(structuredClone(artist));
    }
  }

  public onArtistSave(artist: CodDecorationArtist): void {
    const artists = [...this.form.artists().value()];

    if (this.editedArtistIndex() > -1) {
      artists.splice(this.editedArtistIndex(), 1, artist);
    } else {
      artists.push(artist);
    }

    this.setArtists(artists);
    this.editArtist(null);
  }

  public removeArtist(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete artist?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const items = [...this.form.artists().value()];
          items.splice(index, 1);
          this.setArtists(items);
        }
      });
  }

  public moveArtistUp(index: number): void {
    if (index < 1) {
      return;
    }
    const items = [...this.form.artists().value()];
    const item = items[index];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.setArtists(items);
  }

  public moveArtistDown(index: number): void {
    const items = [...this.form.artists().value()];
    if (index + 1 >= items.length) {
      return;
    }
    const item = items[index];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.setArtists(items);
  }
  //#endregion

  public cancel(): void {
    this.editorClose.emit();
  }

  public onEnterKey(event: Event): void {
    if (
      !isImplicitSubmission(event) ||
      this.form().invalid() ||
      !this.form().dirty()
    ) {
      return;
    }
    event.preventDefault();
    this.save();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.decoration.set(this.getDecoration());
  }
}

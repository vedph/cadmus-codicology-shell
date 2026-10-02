import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { TitleCasePipe } from '@angular/common';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';

import {
  CodDecoration,
  CodDecorationsPart,
  COD_DECORATIONS_PART_TYPEID,
} from '../cod-decorations-part';
import { CodDecorationComponent } from '../cod-decoration/cod-decoration.component';
import { AppRepository } from '@myrmidon/cadmus-state';

/**
 * CodDecorationsPart editor component.
 * Thesauri: cod-decoration-flags, cod-decoration-element-flags,
 * cod-decoration-element-types,
 * cod-decoration-type-hidden, cod-decoration-element-colors,
 * cod-decoration-element-gildings, cod-decoration-element-techniques,
 * cod-decoration-element-positions, cod-decoration-element-tools,
 * cod-decoration-element-tags,
 * cod-decoration-element-typologies, cod-image-types,
 * cod-decoration-artist-types, cod-decoration-artist-style-names,
 * chronotope-tags, assertion-tags, doc-reference-types, doc-reference-tags,
 * external-id-tags, external-id-scopes, pin-link-settings.
 */
/**
 * Settings for the decorations part editor.
 */
interface CodDecorationsPartSettings {
  hideArtists?: boolean;
}

interface CodDecorationsPartControls {
  decorations: CodDecoration[];
}

function toDraft(part?: CodDecorationsPart | null): CodDecorationsPartControls {
  // copy: the form tags the objects in its arrays
  return { decorations: copyFormValue(part?.decorations || []) };
}

@Component({
  selector: 'cadmus-cod-decorations-part',
  templateUrl: './cod-decorations-part.component.html',
  styleUrls: ['./cod-decorations-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatExpansionModule,
    MatIconButton,
    MatTooltip,
    CodDecorationComponent,
    MatCardActions,
    TitleCasePipe,
    HelpLinkComponent,
    CloseSaveButtonsComponent,
  ],
})
export class CodDecorationsPartComponent
  extends ModelEditorComponentBase<CodDecorationsPart> {
  private readonly _dialogService = inject(DialogService);

  // settings for this part type (and role, if any)
  private readonly _settingsResource = resource({
    params: () => ({ roleId: this.identity()?.roleId || undefined }),
    loader: ({ params }) => {
      if (!this._appRepository) {
        return Promise.resolve(undefined);
      }
      return this._appRepository.getSettingFor<CodDecorationsPartSettings>(
        COD_DECORATIONS_PART_TYPEID,
        params.roleId,
      );
    },
  });

  // hideArtists is got from the part settings, if available, otherwise false
  public readonly hideArtists = computed<boolean>(() => {
    if (this._settingsResource.hasValue()) {
      return this._settingsResource.value()?.hideArtists === true;
    }
    return false;
  });

  public readonly editedIndex = signal<number>(-1);
  public readonly editedDecoration = signal<CodDecoration | undefined>(
    undefined,
  );

  // cod-decoration-flags
  public readonly decFlagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-flags']?.entries,
  );
  // cod-decoration-element-flags
  public readonly decElemFlagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-element-flags']?.entries,
  );
  // cod-decoration-element-types (required)
  public readonly decElemTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-element-types']?.entries,
  );
  // cod-decoration-type-hidden
  public readonly decTypeHiddenEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-type-hidden']?.entries,
  );
  // cod-decoration-element-colors
  public readonly decElemColorEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-element-colors']?.entries,
  );
  // cod-decoration-element-gildings
  public readonly decElemGildingEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-element-gildings']?.entries,
  );
  // cod-decoration-element-techniques
  public readonly decElemTechEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-element-techniques']?.entries,
  );
  // cod-decoration-element-positions
  public readonly decElemPosEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-element-positions']?.entries,
  );
  // cod-decoration-element-tags
  public readonly decElemTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-element-tags']?.entries,
  );
  // cod-decoration-element-tools
  public readonly decElemToolEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-element-tools']?.entries,
  );
  // cod-decoration-element-typologies
  public readonly decElemTypolEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-element-typologies']?.entries,
  );
  // cod-image-types
  public readonly imgTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-image-types']?.entries,
  );
  // cod-decoration-artist-types
  public readonly artTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-artist-types']?.entries,
  );
  // cod-decoration-artist-style-names
  public readonly artStyleEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-decoration-artist-style-names']?.entries,
  );
  // chronotope-tags
  public readonly ctTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['chronotope-tags']?.entries,
  );
  // assertion-tags
  public readonly assTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['assertion-tags']?.entries,
  );
  // doc-reference-types
  public readonly refTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly refTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );
  // external-id-tags
  public readonly idTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-tags']?.entries,
  );
  // external-id-scopes
  public readonly idScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-scopes']?.entries,
  );

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();


  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.decorations, 1);
  });

  protected getValue(): CodDecorationsPart {
    const part = this.getEditedPart(COD_DECORATIONS_PART_TYPEID) as CodDecorationsPart;
    part.decorations = copyFormValue(this._draft().decorations);
    return part;
  }

  private setDecorations(decorations: CodDecoration[]): void {
    this.form.decorations().value.set(decorations);
    this.form.decorations().markAsDirty();
  }

  public addDecoration(): void {
    this.editDecoration({
      name: '',
    });
  }

  public editDecoration(decoration: CodDecoration | null, index = -1): void {
    if (!decoration) {
      this.editedIndex.set(-1);
      this.editedDecoration.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedDecoration.set(structuredClone(decoration));
    }
  }

  public onDecorationSave(decoration: CodDecoration): void {
    const decorations = [...this.form.decorations().value()];

    if (this.editedIndex() > -1) {
      decorations.splice(this.editedIndex(), 1, decoration);
    } else {
      decorations.push(decoration);
    }

    this.setDecorations(decorations);
    this.editDecoration(null);
  }

  public deleteDecoration(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete entry?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.form.decorations().value()];
          entries.splice(index, 1);
          this.setDecorations(entries);
        }
      });
  }

  public moveDecorationUp(index: number): void {
    if (index < 1) {
      return;
    }
    const decorationsArray = this.form.decorations().value() || [];
    if (index >= decorationsArray.length) return;

    const entry = decorationsArray[index];
    const entries = [...decorationsArray];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.setDecorations(entries);
  }

  public moveDecorationDown(index: number): void {
    const decorationsArray = this.form.decorations().value() || [];
    if (index + 1 >= decorationsArray.length) {
      return;
    }
    const entry = decorationsArray[index];
    const entries = [...decorationsArray];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.setDecorations(entries);
  }
}

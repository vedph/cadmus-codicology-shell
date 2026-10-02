import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { take } from 'rxjs/operators';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import {
  FlatLookupPipe,
  NgxToolsSignalValidators,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';

import {
  CodShelfmark,
  CodShelfmarksPart,
  COD_SHELFMARKS_PART_TYPEID,
} from '../cod-shelfmarks-part';
import { CodShelfmarkEditorComponent } from '../cod-shelfmark-editor/cod-shelfmark-editor.component';

interface CodShelfmarksPartSettings {
  cityFromLibPattern?: string;
}

interface CodShelfmarksPartControls {
  shelfmarks: CodShelfmark[];
}

function toDraft(part?: CodShelfmarksPart | null): CodShelfmarksPartControls {
  // copy: the form tags the objects in its arrays
  return {
    shelfmarks: copyFormValue(part?.shelfmarks || []),
  };
}

/**
 * CodShelfmarksPart editor component.
 * Thesauri: cod-shelfmark-tags, cod-shelfmark-cities,
 * cod-shelfmark-libraries (all optional).
 * Settings: cityFromLibPattern (optional) - a regular expression pattern
 * used to extract the city from the library name. In this case, city will be
 * disabled in the shelfmark editor and it will be extracted from the library
 * when selected.
 */
@Component({
  selector: 'cadmus-cod-shelfmarks-part',
  templateUrl: './cod-shelfmarks-part.component.html',
  styleUrls: ['./cod-shelfmarks-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatExpansionModule,
    MatButton,
    MatIconButton,
    MatTooltip,
    TitleCasePipe,
    CodShelfmarkEditorComponent,
    MatCardActions,
    FlatLookupPipe,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
})
export class CodShelfmarksPartComponent
  extends ModelEditorComponentBase<CodShelfmarksPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly editedShelfmark = signal<CodShelfmark | undefined>(undefined);

  // cod-shelfmark-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-shelfmark-tags']?.entries,
  );
  // cod-shelfmark-cities
  public readonly cityEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-shelfmark-cities']?.entries,
  );
  // cod-shelfmark-libraries
  public readonly libEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-shelfmark-libraries']?.entries,
  );

  /**
   * This contains the regular expression pattern (when specified in settings)
   * used to extract the city from the library name. In this case, city will be
   * disabled in the shelfmark editor and it will be extracted from the library
   * when selected.
   * For instance, you might set this to `\(([^)]+)\)$` to extract the city
   * from library names like "Marciana (Venice)" or "Nazionale (Florence)".
   */
  public readonly cityFromLibPattern = signal<string | undefined>(undefined);


  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.shelfmarks, 1);
  });

  constructor() {
    super();
    this.initSettings<CodShelfmarksPartSettings>(COD_SHELFMARKS_PART_TYPEID, (settings) =>
      this.cityFromLibPattern.set(settings?.cityFromLibPattern),
    );
  }

  protected getValue(): CodShelfmarksPart {
    const part = this.getEditedPart(COD_SHELFMARKS_PART_TYPEID) as CodShelfmarksPart;
    part.shelfmarks = copyFormValue(this._draft().shelfmarks);
    return part;
  }

  private setShelfmarks(shelfmarks: CodShelfmark[]): void {
    this.form.shelfmarks().value.set(shelfmarks);
    this.form.shelfmarks().markAsDirty();
  }

  public addShelfmark(): void {
    this.editShelfmark({
      city: this.cityEntries()?.length ? this.cityEntries()![0].id : '',
      library: this.libEntries()?.length ? this.libEntries()![0].id : '',
      location: '',
    });
  }

  public editShelfmark(shelfmark: CodShelfmark | null, index = -1): void {
    if (!shelfmark) {
      this.editedIndex.set(-1);
      this.editedShelfmark.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedShelfmark.set(structuredClone(shelfmark));
    }
  }

  public onShelfmarkChange(shelfmark: CodShelfmark): void {
    const shelfmarks = [...this.form.shelfmarks().value()];

    if (this.editedIndex() > -1) {
      shelfmarks.splice(this.editedIndex(), 1, shelfmark);
    } else {
      shelfmarks.push(shelfmark);
    }

    this.setShelfmarks(shelfmarks);
    this.editShelfmark(null);
  }

  public deleteShelfmark(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete shelfmark?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.form.shelfmarks().value()];
          entries.splice(index, 1);
          this.setShelfmarks(entries);
        }
      });
  }

  public moveShelfmarkUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.form.shelfmarks().value()[index];
    const entries = [...this.form.shelfmarks().value()];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.setShelfmarks(entries);
  }

  public moveShelfmarkDown(index: number): void {
    if (index + 1 >= this.form.shelfmarks().value().length) {
      return;
    }
    const entry = this.form.shelfmarks().value()[index];
    const entries = [...this.form.shelfmarks().value()];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.setShelfmarks(entries);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
  NgxToolsValidators,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';

import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
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
    FormsModule,
    ReactiveFormsModule,
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
  ],
})
export class CodShelfmarksPartComponent
  extends ModelEditorComponentBase<CodShelfmarksPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly editedShelfmark = signal<CodShelfmark | undefined>(undefined);

  // cod-shelfmark-tags
  public readonly tagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-shelfmark-cities
  public readonly cityEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-shelfmark-libraries
  public readonly libEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  /**
   * This contains the regular expression pattern (when specified in settings)
   * used to extract the city from the library name. In this case, city will be
   * disabled in the shelfmark editor and it will be extracted from the library
   * when selected.
   * For instance, you might set this to `\(([^)]+)\)$` to extract the city
   * from library names like "Marciana (Venice)" or "Nazionale (Florence)".
   */
  public readonly cityFromLibPattern = signal<string | undefined>(undefined);

  public shelfmarks: FormControl<CodShelfmark[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
    super(authService, formBuilder);
    // form
    this.shelfmarks = formBuilder.control([], {
      nonNullable: true,
      validators: NgxToolsValidators.strictMinLengthValidator(1),
    });
  }

  public override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    // load settings for this part
    if (this._appRepository) {
      const settings = (await this._appRepository.getSettingFor(
        COD_SHELFMARKS_PART_TYPEID,
        this.identity()?.roleId || undefined,
      )) as CodShelfmarksPartSettings | null;
      if (settings) {
        this.cityFromLibPattern.set(settings.cityFromLibPattern);
      }
    }
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      shelfmarks: this.shelfmarks,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-shelfmark-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries.set(thesauri[key].entries);
    } else {
      this.tagEntries.set(undefined);
    }
    key = 'cod-shelfmark-cities';
    if (this.hasThesaurus(key)) {
      this.cityEntries.set(thesauri[key].entries);
    } else {
      this.cityEntries.set(undefined);
    }
    key = 'cod-shelfmark-libraries';
    if (this.hasThesaurus(key)) {
      this.libEntries.set(thesauri[key].entries);
    } else {
      this.libEntries.set(undefined);
    }
  }

  private updateForm(part?: CodShelfmarksPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.shelfmarks.setValue(part.shelfmarks || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodShelfmarksPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodShelfmarksPart {
    let part = this.getEditedPart(
      COD_SHELFMARKS_PART_TYPEID,
    ) as CodShelfmarksPart;
    part.shelfmarks = this.shelfmarks.value || [];
    return part;
  }

  public addShelfmark(): void {
    this.editShelfmark({
      city: this.cityEntries?.length ? this.cityEntries()![0].id : '',
      library: this.libEntries?.length ? this.libEntries()![0].id : '',
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
    const shelfmarks = [...this.shelfmarks.value];

    if (this.editedIndex() > -1) {
      shelfmarks.splice(this.editedIndex(), 1, shelfmark);
    } else {
      shelfmarks.push(shelfmark);
    }

    this.shelfmarks.setValue(shelfmarks);
    this.editShelfmark(null);
  }

  public deleteShelfmark(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete shelfmark?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.shelfmarks.value];
          entries.splice(index, 1);
          this.shelfmarks.setValue(entries);
        }
      });
  }

  public moveShelfmarkUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.shelfmarks.value[index];
    const entries = [...this.shelfmarks.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.shelfmarks.setValue(entries);
  }

  public moveShelfmarkDown(index: number): void {
    if (index + 1 >= this.shelfmarks.value.length) {
      return;
    }
    const entry = this.shelfmarks.value[index];
    const entries = [...this.shelfmarks.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.shelfmarks.setValue(entries);
  }
}

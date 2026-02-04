import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { take } from 'rxjs';
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
import {
  MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';

import {
  NgxToolsValidators,
  FlatLookupPipe,
  deepCopy,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { HistoricalDatePipe } from '@myrmidon/cadmus-refs-historical-date';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  CodMaterialDscPart,
  CodPalimpsest,
  CodUnit,
  COD_MATERIAL_DSC_PART_TYPEID,
} from '../cod-material-dsc-part';
import { CodUnitEditorComponent } from '../cod-unit-editor/cod-unit-editor.component';
import { CodPalimpsestEditorComponent } from '../cod-palimpsest-editor/cod-palimpsest-editor.component';

interface CodMaterialDscPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

/**
 * CodMaterialDsc part editor component.
 * Thesauri: cod-unit-tags, cod-unit-materials, cod-unit-formats,
 * cod-unit-states, chronotope-tags, assertion-tags, doc-reference-types,
 * doc-reference-tags (all optional).
 */
@Component({
  selector: 'cadmus-cod-material-dsc-part',
  templateUrl: './cod-material-dsc-part.component.html',
  styleUrls: ['./cod-material-dsc-part.component.css'],
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
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    CodUnitEditorComponent,
    CodPalimpsestEditorComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
    TitleCasePipe,
    FlatLookupPipe,
    HistoricalDatePipe,
    CodLocationRangePipe,
  ],
})
export class CodMaterialDscPartComponent
  extends ModelEditorComponentBase<CodMaterialDscPart>
  implements OnInit
{
  public readonly editedUt = signal<CodUnit | undefined>(undefined);
  public readonly editedUtIndex = signal<number>(-1);
  public readonly editedPs = signal<CodPalimpsest | undefined>(undefined);
  public readonly editedPsIndex = signal<number>(-1);

  public units: FormControl<CodUnit[]>;
  public palimpsests: FormControl<CodPalimpsest[]>;

  // cod-unit-tags
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-unit-materials
  public materialEntries: ThesaurusEntry[] | undefined;
  // cod-unit-formats
  public formatEntries: ThesaurusEntry[] | undefined;
  // cod-unit-states
  public stateEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
    super(authService, formBuilder);
    // form
    this.units = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.palimpsests = formBuilder.control([], { nonNullable: true });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      units: this.units,
      palimpsests: this.palimpsests,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-unit-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries = thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-unit-materials';
    if (this.hasThesaurus(key)) {
      this.materialEntries = thesauri[key].entries;
    } else {
      this.materialEntries = undefined;
    }
    key = 'cod-unit-formats';
    if (this.hasThesaurus(key)) {
      this.formatEntries = thesauri[key].entries;
    } else {
      this.formatEntries = undefined;
    }
    key = 'cod-unit-states';
    if (this.hasThesaurus(key)) {
      this.stateEntries = thesauri[key].entries;
    } else {
      this.stateEntries = undefined;
    }
    key = 'chronotope-tags';
    if (this.hasThesaurus(key)) {
      this.ctTagEntries = thesauri[key].entries;
    } else {
      this.ctTagEntries = undefined;
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries = thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.refTypeEntries = thesauri[key].entries;
    } else {
      this.refTypeEntries = undefined;
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries = thesauri[key].entries;
    } else {
      this.refTagEntries = undefined;
    }
  }

  private updateForm(part?: CodMaterialDscPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.units.setValue(part.units || []);
    this.palimpsests.setValue(part.palimpsests || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodMaterialDscPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }
    // settings
    this._appRepository
      ?.getSettingFor<CodMaterialDscPartSettings>(
        COD_MATERIAL_DSC_PART_TYPEID,
        this.identity()?.roleId || undefined,
      )
      .then((settings) => {
        const options = settings?.lookupProviderOptions;
        this.lookupProviderOptions.set(options || undefined);
      });
    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodMaterialDscPart {
    let part = this.getEditedPart(
      COD_MATERIAL_DSC_PART_TYPEID,
    ) as CodMaterialDscPart;
    part.units = this.units.value || [];
    part.palimpsests = this.palimpsests.value?.length
      ? this.palimpsests.value
      : undefined;
    return part;
  }

  //#region Units
  public addUnit(): void {
    this.editUnit({
      material: this.materialEntries?.length ? this.materialEntries[0].id : '',
      format: this.formatEntries?.length ? this.formatEntries[0].id : '',
      state: this.stateEntries?.length ? this.stateEntries[0].id : '',
      ranges: [],
    });
  }

  public editUnit(unit: CodUnit | null, index = -1): void {
    this.editedPsIndex.set(-1);
    this.editedPs.set(undefined);

    if (!unit) {
      this.editedUtIndex.set(-1);
      this.editedUt.set(undefined);
    } else {
      this.editedUtIndex.set(index);
      this.editedUt.set(deepCopy(unit));
    }
  }

  public onUnitChange(unit: CodUnit): void {
    const units = [...this.units.value];

    if (this.editedUtIndex() > -1) {
      units.splice(this.editedUtIndex(), 1, unit);
    } else {
      units.push(unit);
    }

    this.units.setValue(units);
    this.units.updateValueAndValidity();
    this.units.markAsDirty();
    this.editUnit(null);
  }

  public deleteUnit(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete unit?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const units = [...this.units.value];
          units.splice(index, 1);
          this.units.setValue(units);
          this.units.updateValueAndValidity();
          this.units.markAsDirty();
        }
      });
  }

  public moveUnitUp(index: number): void {
    if (index < 1) {
      return;
    }
    const unit = this.units.value[index];
    const units = [...this.units.value];
    units.splice(index, 1);
    units.splice(index - 1, 0, unit);
    this.units.setValue(units);
    this.units.updateValueAndValidity();
    this.units.markAsDirty();
  }

  public moveUnitDown(index: number): void {
    if (index + 1 >= this.units.value.length) {
      return;
    }
    const unit = this.units.value[index];
    const units = [...this.units.value];
    units.splice(index, 1);
    units.splice(index + 1, 0, unit);
    this.units.setValue(units);
    this.units.updateValueAndValidity();
    this.units.markAsDirty();
  }
  //#endregion

  //#region Palimpsests
  public addPalimpsest(): void {
    this.editPalimpsest({
      ranges: [{ start: { n: 0 }, end: { n: 0 } }],
    });
  }

  public editPalimpsest(palimpsest: CodPalimpsest | null, index = -1): void {
    this.editedUtIndex.set(-1);
    this.editedUt.set(undefined);

    if (!palimpsest) {
      this.editedPsIndex.set(-1);
      this.editedPs.set(undefined);
    } else {
      this.editedPsIndex.set(index);
      this.editedPs.set(deepCopy(palimpsest));
    }
  }

  public onPalimpsestChange(palimpsest: CodPalimpsest): void {
    const palimpsests = [...this.palimpsests.value];

    if (this.editedPsIndex() > -1) {
      palimpsests.splice(this.editedPsIndex(), 1, palimpsest);
    } else {
      palimpsests.push(palimpsest);
    }

    this.palimpsests.setValue(palimpsests);
    this.palimpsests.updateValueAndValidity();
    this.palimpsests.markAsDirty();
    this.editPalimpsest(null);
  }

  public deletePalimpsest(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete palimpsest?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const palimpsests = [...this.palimpsests.value];
          palimpsests.splice(index, 1);
          this.palimpsests.setValue(palimpsests);
          this.palimpsests.updateValueAndValidity();
          this.palimpsests.markAsDirty();
        }
      });
  }

  public movePalimpsestUp(index: number): void {
    if (index < 1) {
      return;
    }
    const palimpsest = this.palimpsests.value[index];
    const palimpsests = [...this.palimpsests.value];
    palimpsests.splice(index, 1);
    palimpsests.splice(index - 1, 0, palimpsest);
    this.palimpsests.setValue(palimpsests);
    this.palimpsests.updateValueAndValidity();
    this.palimpsests.markAsDirty();
  }

  public movePalimpsestDown(index: number): void {
    if (index + 1 >= this.palimpsests.value.length) {
      return;
    }
    const palimpsest = this.palimpsests.value[index];
    const palimpsests = [...this.palimpsests.value];
    palimpsests.splice(index, 1);
    palimpsests.splice(index + 1, 0, palimpsest);
    this.palimpsests.setValue(palimpsests);
    this.palimpsests.updateValueAndValidity();
    this.palimpsests.markAsDirty();
  }
  //#endregion
}

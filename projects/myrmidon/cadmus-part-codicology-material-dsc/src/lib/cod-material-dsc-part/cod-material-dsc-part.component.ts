import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
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

import { NgxToolsSignalValidators, FlatLookupPipe } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { HistoricalDatePipe } from '@myrmidon/cadmus-refs-historical-date';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
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

interface CodMaterialDscPartControls {
  units: CodUnit[];
  palimpsests: CodPalimpsest[];
}

function toDraft(part?: CodMaterialDscPart | null): CodMaterialDscPartControls {
  // copy: the form tags the objects in its arrays
  return {
    units: copyFormValue(part?.units || []),
    palimpsests: copyFormValue(part?.palimpsests || []),
  };
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
    HelpLinkComponent,
  ],
})
export class CodMaterialDscPartComponent
  extends ModelEditorComponentBase<CodMaterialDscPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedUt = signal<CodUnit | undefined>(undefined);
  public readonly editedUtIndex = signal<number>(-1);
  public readonly editedPs = signal<CodPalimpsest | undefined>(undefined);
  public readonly editedPsIndex = signal<number>(-1);


  // cod-unit-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-unit-tags']?.entries,
  );
  // cod-unit-materials
  public readonly materialEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-unit-materials']?.entries,
  );
  // cod-unit-formats
  public readonly formatEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-unit-formats']?.entries,
  );
  // cod-unit-states
  public readonly stateEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-unit-states']?.entries,
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

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  //#region Units
  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.units, 1);
  });

  constructor() {
    super();
    this.initSettings<CodMaterialDscPartSettings>(COD_MATERIAL_DSC_PART_TYPEID, (settings) =>
      this.lookupProviderOptions.set(settings?.lookupProviderOptions || undefined),
    );
  }

  protected getValue(): CodMaterialDscPart {
    const part = this.getEditedPart(COD_MATERIAL_DSC_PART_TYPEID) as CodMaterialDscPart;
    part.units = copyFormValue(this._draft().units);
    part.palimpsests = this._draft().palimpsests.length
      ? copyFormValue(this._draft().palimpsests)
      : undefined;
    return part;
  }

  private setUnits(units: CodUnit[]): void {
    this.form.units().value.set(units);
    this.form.units().markAsDirty();
  }

  private setPalimpsests(palimpsests: CodPalimpsest[]): void {
    this.form.palimpsests().value.set(palimpsests);
    this.form.palimpsests().markAsDirty();
  }

  public addUnit(): void {
    this.editUnit({
      material: this.materialEntries()?.length
        ? this.materialEntries()![0].id
        : '',
      state: this.stateEntries()?.length ? this.stateEntries()![0].id : '',
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
      this.editedUt.set(structuredClone(unit));
    }
  }

  public onUnitChange(unit: CodUnit): void {
    const units = [...this.form.units().value()];

    if (this.editedUtIndex() > -1) {
      units.splice(this.editedUtIndex(), 1, unit);
    } else {
      units.push(unit);
    }

    this.setUnits(units);
    this.editUnit(null);
  }

  public deleteUnit(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete unit?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const units = [...this.form.units().value()];
          units.splice(index, 1);
          this.setUnits(units);
        }
      });
  }

  public moveUnitUp(index: number): void {
    if (index < 1) {
      return;
    }
    const unit = this.form.units().value()[index];
    const units = [...this.form.units().value()];
    units.splice(index, 1);
    units.splice(index - 1, 0, unit);
    this.setUnits(units);
  }

  public moveUnitDown(index: number): void {
    if (index + 1 >= this.form.units().value().length) {
      return;
    }
    const unit = this.form.units().value()[index];
    const units = [...this.form.units().value()];
    units.splice(index, 1);
    units.splice(index + 1, 0, unit);
    this.setUnits(units);
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
      this.editedPs.set(structuredClone(palimpsest));
    }
  }

  public onPalimpsestChange(palimpsest: CodPalimpsest): void {
    const palimpsests = [...this.form.palimpsests().value()];

    if (this.editedPsIndex() > -1) {
      palimpsests.splice(this.editedPsIndex(), 1, palimpsest);
    } else {
      palimpsests.push(palimpsest);
    }

    this.setPalimpsests(palimpsests);
    this.editPalimpsest(null);
  }

  public deletePalimpsest(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete palimpsest?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const palimpsests = [...this.form.palimpsests().value()];
          palimpsests.splice(index, 1);
          this.setPalimpsests(palimpsests);
        }
      });
  }

  public movePalimpsestUp(index: number): void {
    if (index < 1) {
      return;
    }
    const palimpsest = this.form.palimpsests().value()[index];
    const palimpsests = [...this.form.palimpsests().value()];
    palimpsests.splice(index, 1);
    palimpsests.splice(index - 1, 0, palimpsest);
    this.setPalimpsests(palimpsests);
  }

  public movePalimpsestDown(index: number): void {
    if (index + 1 >= this.form.palimpsests().value().length) {
      return;
    }
    const palimpsest = this.form.palimpsests().value()[index];
    const palimpsests = [...this.form.palimpsests().value()];
    palimpsests.splice(index, 1);
    palimpsests.splice(index + 1, 0, palimpsest);
    this.setPalimpsests(palimpsests);
  }
  //#endregion
}

import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodMaterialDscPart,
  CodPalimpsest,
  CodUnit,
  COD_MATERIAL_DSC_PART_TYPEID,
} from '../cod-material-dsc-part';
import { take } from 'rxjs';
import { DialogService } from '@myrmidon/ng-mat-tools';

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
})
export class CodMaterialDscPartComponent
  extends ModelEditorComponentBase<CodMaterialDscPart>
  implements OnInit
{
  private _editedUtIndex: number;
  private _editedPsIndex: number;
  public tabIndex: number;
  public editedUt: CodUnit | undefined;
  public editedPs: CodUnit | undefined;

  public units: FormControl;
  public palimpsests: FormControl;

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

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedUtIndex = -1;
    this._editedPsIndex = -1;
    this.tabIndex = 0;
    // form
    this.units = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.palimpsests = formBuilder.control([]);
    this.form = formBuilder.group({
      units: this.units,
      palimpsests: this.palimpsests,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodMaterialDscPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.units.setValue(model.units || []);
    this.palimpsests.setValue(model.palimpsests || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodMaterialDscPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'cod-unit-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.tagEntries = this.thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-unit-materials';
    if (this.thesauri && this.thesauri[key]) {
      this.materialEntries = this.thesauri[key].entries;
    } else {
      this.materialEntries = undefined;
    }
    key = 'cod-unit-formats';
    if (this.thesauri && this.thesauri[key]) {
      this.formatEntries = this.thesauri[key].entries;
    } else {
      this.formatEntries = undefined;
    }
    key = 'cod-unit-states';
    if (this.thesauri && this.thesauri[key]) {
      this.stateEntries = this.thesauri[key].entries;
    } else {
      this.stateEntries = undefined;
    }
    key = 'chronotope-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.ctTagEntries = this.thesauri[key].entries;
    } else {
      this.ctTagEntries = undefined;
    }
    key = 'assertion-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.assTagEntries = this.thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'doc-reference-types';
    if (this.thesauri && this.thesauri[key]) {
      this.refTypeEntries = this.thesauri[key].entries;
    } else {
      this.refTypeEntries = undefined;
    }
    key = 'doc-reference-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.refTagEntries = this.thesauri[key].entries;
    } else {
      this.refTagEntries = undefined;
    }
  }

  protected getModelFromForm(): CodMaterialDscPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_MATERIAL_DSC_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        units: [],
      };
    }
    part.units = this.units.value || [];
    part.palimpsests = this.palimpsests.value?.length
      ? this.palimpsests.value
      : undefined;
    return part;
  }

  //#region Units
  public addUnit(): void {
    const unit: CodUnit = {
      material: this.materialEntries?.length ? this.materialEntries[0].id : '',
      format: this.formatEntries?.length ? this.formatEntries[0].id : '',
      state: this.stateEntries?.length ? this.stateEntries[0].id : '',
      range: { start: { n: 0 }, end: { n: 0 } },
    };
    this.units.setValue([...this.units.value, unit]);
    this.editUnit(this.units.value.length - 1);
  }

  public editUnit(index: number): void {
    this._editedPsIndex = -1;
    this.editedPs = undefined;

    if (index < 0) {
      this._editedUtIndex = -1;
      this.tabIndex = 0;
      this.editedUt = undefined;
    } else {
      this._editedUtIndex = index;
      this.editedUt = this.units.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onUnitSave(entry: CodUnit): void {
    this.units.setValue(
      this.units.value.map((e: CodUnit, i: number) =>
        i === this._editedUtIndex ? entry : e
      )
    );
    this.editUnit(-1);
  }

  public onUnitClose(): void {
    this.editUnit(-1);
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
  }
  //#endregion

  //#region Palimpsests
  public addPalimpsest(): void {
    const palimpsest: CodPalimpsest = {
      range: { start: { n: 0 }, end: { n: 0 } },
    };
    this.palimpsests.setValue([...this.palimpsests.value, palimpsest]);
    this.editPalimpsest(this.palimpsests.value.length - 1);
  }

  public editPalimpsest(index: number): void {
    this._editedUtIndex = -1;
    this.editedUt = undefined;

    if (index < 0) {
      this._editedPsIndex = -1;
      this.tabIndex = 0;
      this.editedPs = undefined;
    } else {
      this._editedPsIndex = index;
      this.editedPs = this.palimpsests.value[index];
      setTimeout(() => {
        this.tabIndex = 2;
      }, 300);
    }
  }

  public onPalimpsestSave(entry: CodPalimpsest): void {
    this.palimpsests.setValue(
      this.palimpsests.value.map((e: CodPalimpsest, i: number) =>
        i === this._editedPsIndex ? entry : e
      )
    );
    this.editPalimpsest(-1);
  }

  public onPalimpsestClose(): void {
    this.editPalimpsest(-1);
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
  }
  //#endregion
}

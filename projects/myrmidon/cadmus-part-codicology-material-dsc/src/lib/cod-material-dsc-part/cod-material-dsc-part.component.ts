import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

import { deepCopy } from '@myrmidon/ng-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodMaterialDscPart,
  COD_MATERIAL_DSC_PART_TYPEID,
} from '../cod-material-dsc-part';

/**
 * CodMaterialDsc part editor component.
 * Thesauri: TODO thesauri names and optionality
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
  // TODO form controls (form: FormGroup is inherited)

  // TODO thesauri entries, e.g.:
  // public tagEntries: ThesaurusEntry[] | undefined;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService);
    // form
    // TODO build controls and set this.form
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodMaterialDscPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    // TODO set controls values from model
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodMaterialDscPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    // TODO set entries from this.thesauri, e.g.:
    // const key = 'note-tags';
    // if (this.thesauri && this.thesauri[key]) {
    // this.tagEntries = this.thesauri[key].entries;
    // } else {
    //   this.tagEntries = undefined;
    // }
    // if not using any thesauri, just remove this function
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
    // TODO set part.properties from form controls
    return part;
  }
}

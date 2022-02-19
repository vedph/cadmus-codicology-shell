import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

import { deepCopy } from '@myrmidon/ng-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodSheetLabelsPart,
  COD_SHEET_LABELS_PART_TYPEID,
} from '../cod-sheet-labels-part';

/**
 * CodSheetLabels part editor component.
 * Thesauri: cod-catchwords-positions, cod-numbering-systems,
 * cod-numbering-techniques, cod-numbering-positions,
 * cod-numbering-colors, cod-quiresig-systems,
 * cod-quiresig-positions, cod-endleaf-materials, chronotope-tags,
 * assertion-tags, doc-reference-types, doc-reference-tags.
 */
@Component({
  selector: 'cadmus-cod-sheet-labels-part',
  templateUrl: './cod-sheet-labels-part.component.html',
  styleUrls: ['./cod-sheet-labels-part.component.css'],
})
export class CodSheetLabelsPartComponent
  extends ModelEditorComponentBase<CodSheetLabelsPart>
  implements OnInit
{
  // TODO form controls (form: FormGroup is inherited)

  // C-COL
  // cod-catchwords-positions
  public poscEntries: ThesaurusEntry[] | undefined;
  // N-COL
  // cod-numbering-systems
  public sysnEntries: ThesaurusEntry[] | undefined;
  // cod-numbering-techniques
  public techEntries: ThesaurusEntry[] | undefined;
  // cod-numbering-positions
  public posnEntries: ThesaurusEntry[] | undefined;
  // cod-numbering-colors
  public clrEntries: ThesaurusEntry[] | undefined;
  // R/S-COL
  // cod-quiresig-systems
  public syssEntries: ThesaurusEntry[] | undefined;
  // cod-quiresig-positions
  public possEntries: ThesaurusEntry[] | undefined;
  // ENDLEAF
  // cod-endleaf-materials
  public matEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService);
    // form
    // TODO
    this.form = formBuilder.group({});
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodSheetLabelsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    // TODO set controls values from model
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodSheetLabelsPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'cod-catchwords-positions';
    if (this.thesauri && this.thesauri[key]) {
      this.poscEntries = this.thesauri[key].entries;
    } else {
      this.poscEntries = undefined;
    }
    key = 'cod-numbering-systems';
    if (this.thesauri && this.thesauri[key]) {
      this.sysnEntries = this.thesauri[key].entries;
    } else {
      this.sysnEntries = undefined;
    }
    key = 'cod-numbering-techniques';
    if (this.thesauri && this.thesauri[key]) {
      this.techEntries = this.thesauri[key].entries;
    } else {
      this.techEntries = undefined;
    }
    key = 'cod-numbering-positions';
    if (this.thesauri && this.thesauri[key]) {
      this.posnEntries = this.thesauri[key].entries;
    } else {
      this.posnEntries = undefined;
    }
    key = 'cod-numbering-colors';
    if (this.thesauri && this.thesauri[key]) {
      this.clrEntries = this.thesauri[key].entries;
    } else {
      this.clrEntries = undefined;
    }
    key = 'cod-quiresig-systems';
    if (this.thesauri && this.thesauri[key]) {
      this.syssEntries = this.thesauri[key].entries;
    } else {
      this.syssEntries = undefined;
    }
    key = 'cod-quiresig-positions';
    if (this.thesauri && this.thesauri[key]) {
      this.possEntries = this.thesauri[key].entries;
    } else {
      this.possEntries = undefined;
    }
    key = 'cod-endleaf-materials';
    if (this.thesauri && this.thesauri[key]) {
      this.matEntries = this.thesauri[key].entries;
    } else {
      this.matEntries = undefined;
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

  protected getModelFromForm(): CodSheetLabelsPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_SHEET_LABELS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        rows: [],
      };
    }
    // TODO set part.properties from form controls
    return part;
  }
}

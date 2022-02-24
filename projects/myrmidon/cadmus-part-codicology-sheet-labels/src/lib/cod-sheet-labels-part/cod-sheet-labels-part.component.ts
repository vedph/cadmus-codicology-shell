import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';

import { deepCopy } from '@myrmidon/ng-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodSheetLabelsPart,
  COD_SHEET_LABELS_PART_TYPEID,
} from '../cod-sheet-labels-part';
import { CodLabelCell, LabelGenerator } from '../label-generator';
import { Observable } from 'rxjs';
import { CodRowViewModel, CodSheetTable } from '../cod-sheet-table';

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
  private _table: CodSheetTable;

  public columns$: Observable<string[]>;
  public rows$: Observable<CodRowViewModel[]>;

  public opColumn: FormControl;
  public opAction: FormControl;
  public opForm: FormGroup;

  public types: ThesaurusEntry[];
  public addType: FormControl;
  public addName: FormControl;
  public addCount: FormControl;
  public addForm: FormGroup;

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
    this._table = new CodSheetTable();
    this.columns$ = this._table.columnIds$;
    this.rows$ = this._table.rows$;
    this.types = [
      { id: 'row-1', value: 'front endleaf page' },
      { id: 'row-2', value: 'body page' },
      { id: 'row-3', value: 'back endleaf page' },
      { id: 'col-q', value: 'quire column' },
      { id: 'col-n', value: 'numbering column' },
      { id: 'col-c', value: 'catchword column' },
      { id: 'col-s', value: 'signature column' },
      { id: 'col-r', value: 'register column' },
    ];
    // forms
    this.opColumn = formBuilder.control(null, Validators.required);
    this.opAction = formBuilder.control(null, [
      Validators.required,
      Validators.pattern(LabelGenerator.PATTERN),
    ]);
    this.opForm = formBuilder.group({
      opColumn: this.opColumn,
      opAction: this.opAction,
    });

    this.addType = formBuilder.control(this.types[1].id, Validators.required);
    this.addName = formBuilder.control(null, Validators.maxLength(50));
    this.addCount = formBuilder.control(1);
    this.addForm = formBuilder.group({
      addType: this.addType,
      addName: this.addName,
      addCount: this.addCount,
    });

    this.form = formBuilder.group({
      op: this.opForm,
      add: this.addForm,
    });
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
    this._table.setRows(model.rows || []);
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
    // TODO definitions
    part.rows = this._table.getRows();
    return part;
  }
}

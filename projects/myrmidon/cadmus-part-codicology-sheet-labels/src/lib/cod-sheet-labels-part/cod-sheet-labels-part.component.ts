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
  CodEndleaf,
  CodSheetLabelsPart,
  COD_SHEET_LABELS_PART_TYPEID,
} from '../cod-sheet-labels-part';
import { CodLabelCell, LabelGenerator } from '../label-generator';
import { Observable, take } from 'rxjs';
import { CodRowType, CodRowViewModel, CodSheetTable } from '../cod-sheet-table';
import { DialogService } from '@myrmidon/ng-mat-tools';

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
  private _editedEndleafIndex;

  public editedEndleaf: CodEndleaf | undefined;

  public columns$: Observable<string[]>;
  public rows$: Observable<CodRowViewModel[]>;
  public qPresent: boolean;

  public opColumn: FormControl;
  public opAction: FormControl;
  public opForm: FormGroup;

  public addType: FormControl;
  public addName: FormControl;
  public addCount: FormControl;
  public addForm: FormGroup;
  public adderColumn: boolean;

  public endleaves: FormControl;

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

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._table = new CodSheetTable();
    this.columns$ = this._table.columnIds$;
    this.rows$ = this._table.rows$;
    this.adderColumn = false;
    this.qPresent = false;

    this._editedEndleafIndex = -1;
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

    this.addType = formBuilder.control('row-2', Validators.required);
    this.addName = formBuilder.control(null, Validators.maxLength(50));
    this.addCount = formBuilder.control(1);
    this.addForm = formBuilder.group({
      addType: this.addType,
      addName: this.addName,
      addCount: this.addCount,
    });

    this.endleaves = formBuilder.control([]);

    this.form = formBuilder.group({
      op: this.opForm,
      add: this.addForm,
      endleaves: this.endleaves,
    });
  }

  public ngOnInit(): void {
    this.addType.valueChanges.subscribe((v) => {
      this.adderColumn = v && (v as string).startsWith('col');
    });
    this.initEditor();
  }

  private updateForm(model: CodSheetLabelsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this._table.setRows(model.rows || []);
    this.endleaves.setValue(model.endleaves || []);
    // TODO set controls values from model

    // other values in UI
    this.qPresent = this._table.hasColumn('q');
    if (!this.addType.value) {
      this.addType.setValue('row-2');
    }

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
    part.endleaves = this.endleaves.value?.length
      ? this.endleaves.value
      : undefined;
    return part;
  }

  public onAction(): void {
    if (this.opForm.invalid) {
      return;
    }
    const cells = LabelGenerator.generateFrom(
      this.opColumn.value,
      this.opAction.value
    );
    this._table.addCells(cells);
  }

  public onTypeAdd(): void {
    if (this.addForm.invalid) {
      return;
    }
    if (this.addType.value.startsWith('row-')) {
      let type: CodRowType;
      switch (this.addType.value) {
        case 'row-1':
          type = CodRowType.EndleafFront;
          break;
        case 'row-3':
          type = CodRowType.EndleafBack;
          break;
        default:
          type = CodRowType.Body;
          break;
      }
      this._table.appendRows(type, this.addCount.value || 1);
    } else {
      const id =
        this.addType.value.charAt(4) +
        (this.addName.value ? '.' + this.addName.value : '');
      this._table.addColumn(id);
      if (id.charAt(0) === 'q') {
        this.qPresent = true;
      }
      setTimeout(() => this.opColumn.setValue(id), 200);
    }
  }

  public onDeleteColumn(): void {
    if (!this.opColumn.value) {
      return;
    }
    this._dialogService
      .confirm('Confirmation', `Delete column ${this.opColumn.value}?`)
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          this._table.deleteColumn(this.opColumn.value);
        }
      });
  }

  public onTrimRows(): void {
    this._dialogService
      .confirm('Confirmation', `Trim rows?`)
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          this._table.trim();
        }
      });
  }

  public onTrimRowCols(): void {
    this._dialogService
      .confirm('Confirmation', `Trim rows and columns?`)
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          this._table.trim(true);
        }
      });
  }

  public onCellChange(cell: CodLabelCell): void {
    // cell was edited, update it
    this._table.updateCell(cell);
  }

  //#region endleaves
  public addEndleaf(): void {
    const item: CodEndleaf = {
      location: '',
      material: this.matEntries?.length ? this.matEntries[0].id : '',
    };
    this.endleaves.setValue([...this.endleaves.value, item]);
    this.endleaves.markAsDirty();
    this.editEndleaf(this.endleaves.value.length - 1);
  }

  public editEndleaf(index: number): void {
    if (index < 0) {
      this._editedEndleafIndex = -1;
      this.editedEndleaf = undefined;
    } else {
      this._editedEndleafIndex = index;
      this.editedEndleaf = this.endleaves.value[index];
    }
  }

  public onEndleafSave(item: CodEndleaf): void {
    this.endleaves.setValue(
      this.endleaves.value.map((x: CodEndleaf, i: number) =>
        i === this._editedEndleafIndex ? item : x
      )
    );
    this.endleaves.markAsDirty();
    this.editEndleaf(-1);
  }

  public onEndleafClose(): void {
    this.editEndleaf(-1);
  }

  public deleteEndleaf(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete endleaf?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const items = [...this.endleaves.value];
          items.splice(index, 1);
          this.endleaves.setValue(items);
          this.endleaves.markAsDirty();
        }
      });
  }

  public moveEndleafUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.endleaves.value[index];
    const items = [...this.endleaves.value];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.endleaves.setValue(items);
    this.endleaves.markAsDirty();
  }

  public moveEndleafDown(index: number): void {
    if (index + 1 >= this.endleaves.value.length) {
      return;
    }
    const item = this.endleaves.value[index];
    const items = [...this.endleaves.value];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.endleaves.setValue(items);
    this.endleaves.markAsDirty();
  }
  //#endregion
}

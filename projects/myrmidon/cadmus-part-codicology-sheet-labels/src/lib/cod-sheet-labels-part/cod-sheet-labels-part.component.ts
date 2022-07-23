import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Observable, take } from 'rxjs';

import { deepCopy } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodCColDefinition,
  CodEndleaf,
  CodNColDefinition,
  CodRColDefinition,
  CodSColDefinition,
  CodSheetLabelsPart,
  COD_SHEET_LABELS_PART_TYPEID,
} from '../cod-sheet-labels-part';
import { CodLabelCell, LabelGenerator } from '../label-generator';
import { CodRowType, CodRowViewModel, CodSheetTable } from '../cod-sheet-table';

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
  private _editedNDefIndex;
  private _editedCDefIndex;
  private _editedSDefIndex;
  private _editedRDefIndex;

  public editedNDef?: CodNColDefinition;
  public editedCDef?: CodCColDefinition;
  public editedSDef?: CodSColDefinition;
  public editedRDef?: CodRColDefinition;
  public editedDefId?: string;
  public editedEndleaf: CodEndleaf | undefined;

  public columns$: Observable<string[]>;
  public rows$: Observable<CodRowViewModel[]>;
  public endleafRowIds: string[];
  public qPresent: boolean;

  public opColumn: FormControl<string | null>;
  public opAction: FormControl<string | null>;
  public opForm: FormGroup;

  public addType: FormControl<string>;
  public addName: FormControl<string | null>;
  public addCount: FormControl<number>;
  public addForm: FormGroup;
  public adderColumn: boolean;

  public nDefs: FormControl<CodNColDefinition[]>;
  public cDefs: FormControl<CodCColDefinition[]>;
  public sDefs: FormControl<CodSColDefinition[]>;
  public rDefs: FormControl<CodRColDefinition[]>;

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
    this.endleafRowIds = [];
    this.adderColumn = false;
    this.qPresent = false;

    this._editedNDefIndex = -1;
    this._editedCDefIndex = -1;
    this._editedSDefIndex = -1;
    this._editedRDefIndex = -1;
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

    this.addType = formBuilder.control('row-2', {
      nonNullable: true,
      validators: Validators.required,
    });
    this.addName = formBuilder.control(null, Validators.maxLength(50));
    this.addCount = formBuilder.control(1, { nonNullable: true });
    this.addForm = formBuilder.group({
      addType: this.addType,
      addName: this.addName,
      addCount: this.addCount,
    });

    this.nDefs = formBuilder.control([], { nonNullable: true });
    this.cDefs = formBuilder.control([], { nonNullable: true });
    this.sDefs = formBuilder.control([], { nonNullable: true });
    this.rDefs = formBuilder.control([], { nonNullable: true });

    this.endleaves = formBuilder.control([]);

    this.form = formBuilder.group({
      nDefs: this.nDefs,
      cDefs: this.cDefs,
      sDefs: this.sDefs,
      rDefs: this.rDefs,
      endleaves: this.endleaves,
    });
  }

  public ngOnInit(): void {
    this.rows$.subscribe((rows) => {
      this.endleafRowIds = [
        ...new Set(
          rows
            .filter((r) => r.id.startsWith('('))
            .map((r) => r.id.replace(/[rv]\)/, ')'))
        ),
      ];
    });
    this.addType.valueChanges.subscribe((v) => {
      this.adderColumn = v && (v as string).startsWith('col') ? true : false;
    });
    this.initEditor();
  }

  private updateForm(model: CodSheetLabelsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this._table.setRows(model.rows || []);
    this.nDefs.setValue(model.nDefinitions || []);
    this.cDefs.setValue(model.cDefinitions || []);
    this.sDefs.setValue(model.sDefinitions || []);
    this.rDefs.setValue(model.rDefinitions || []);
    this.endleaves.setValue(model.endleaves || []);

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
    part.rows = this._table.getRows();
    part.nDefinitions = this.nDefs.value?.length ? this.nDefs.value : undefined;
    part.cDefinitions = this.cDefs.value?.length ? this.cDefs.value : undefined;
    part.sDefinitions = this.sDefs.value?.length ? this.sDefs.value : undefined;
    part.rDefinitions = this.rDefs.value?.length ? this.rDefs.value : undefined;
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
      this.opColumn.value!,
      this.opAction.value!
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
      // count by 2 as operators work with sheets rather than pages
      this._table.appendRows(type, 2 * (this.addCount.value || 1));
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
          this._table.deleteColumn(this.opColumn.value!);
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

  //#region definitions
  private getDefaultEntryId(entries: ThesaurusEntry[] | undefined): string {
    return entries?.length ? entries[0].id : '';
  }

  private closeAllDefEditors(): void {
    this.editedDefId = undefined;

    this.editedNDef = undefined;
    this._editedNDefIndex = -1;

    this.editedCDef = undefined;
    this._editedCDefIndex = -1;

    this.editedSDef = undefined;
    this._editedSDefIndex = -1;

    this.editedRDef = undefined;
    this._editedRDefIndex = -1;
  }

  public onEditColumnDefinition(): void {
    if (!this.opColumn.value) {
      return;
    }

    this.closeAllDefEditors();

    switch (this.opColumn.value.charAt(0)) {
      case 'n':
        const nDefs = this.nDefs.value as CodNColDefinition[];
        let nDef = nDefs.find((d) => d.id === this.opColumn.value);
        if (!nDef) {
          nDef = {
            id: this.opColumn.value,
            rank: 0,
            system: this.getDefaultEntryId(this.sysnEntries),
            technique: this.getDefaultEntryId(this.techEntries),
            position: this.getDefaultEntryId(this.posnEntries),
          };
        } else {
          this._editedNDefIndex = nDefs.indexOf(nDef);
        }
        this.editedNDef = nDef;
        this.editedDefId = nDef.id;
        break;
      case 'c':
        const cDefs = this.cDefs.value as CodCColDefinition[];
        let cDef = cDefs.find((d) => d.id === this.opColumn.value);
        if (!cDef) {
          cDef = {
            id: this.opColumn.value,
            rank: 0,
            position: this.getDefaultEntryId(this.poscEntries),
          };
        } else {
          this._editedCDefIndex = cDefs.indexOf(cDef);
        }
        this.editedCDef = cDef;
        this.editedDefId = cDef.id;
        break;
      case 's':
        const sDefs = this.sDefs.value as CodSColDefinition[];
        let sDef = sDefs.find((d) => d.id === this.opColumn.value);
        if (!sDef) {
          sDef = {
            id: this.opColumn.value,
            rank: 0,
            system: this.getDefaultEntryId(this.syssEntries),
            position: this.getDefaultEntryId(this.possEntries),
          };
        } else {
          this._editedNDefIndex = sDefs.indexOf(sDef);
        }
        this.editedSDef = sDef;
        this.editedDefId = sDef.id;
        break;
      case 'r':
        const rDefs = this.rDefs.value as CodRColDefinition[];
        let rDef = rDefs.find((d) => d.id === this.opColumn.value);
        if (!rDef) {
          rDef = {
            id: this.opColumn.value,
            rank: 0,
            position: this.getDefaultEntryId(this.possEntries),
          };
        } else {
          this._editedNDefIndex = rDefs.indexOf(rDef);
        }
        this.editedRDef = rDef;
        this.editedDefId = rDef.id;
        break;
    }
  }

  public onColumnDefClose(): void {
    this.closeAllDefEditors();
  }

  public onEditedNDefChange(def: CodNColDefinition): void {
    const defs = [...this.nDefs.value];
    if (this._editedNDefIndex === -1) {
      defs.push(def);
    } else {
      defs.splice(this._editedNDefIndex, 1, def);
    }
    this.nDefs.setValue(defs);
    this.nDefs.updateValueAndValidity();
    this.nDefs.markAsDirty();
    this.closeAllDefEditors();
  }

  public onEditedCDefChange(def: CodCColDefinition): void {
    const defs = [...this.cDefs.value];
    if (this._editedCDefIndex === -1) {
      defs.push(def);
    } else {
      defs.splice(this._editedCDefIndex, 1, def);
    }
    this.cDefs.setValue(defs);
    this.cDefs.updateValueAndValidity();
    this.cDefs.markAsDirty();
    this.closeAllDefEditors();
  }

  public onEditedSDefChange(def: CodSColDefinition): void {
    const defs = [...this.sDefs.value];
    if (this._editedSDefIndex === -1) {
      defs.push(def);
    } else {
      defs.splice(this._editedSDefIndex, 1, def);
    }
    this.sDefs.setValue(defs);
    this.sDefs.updateValueAndValidity();
    this.sDefs.markAsDirty();
    this.closeAllDefEditors();
  }

  public onEditedRDefChange(def: CodRColDefinition): void {
    const defs = [...this.rDefs.value];
    if (this._editedRDefIndex === -1) {
      defs.push(def);
    } else {
      defs.splice(this._editedRDefIndex, 1, def);
    }
    this.rDefs.setValue(defs);
    this.rDefs.updateValueAndValidity();
    this.rDefs.markAsDirty();
    this.closeAllDefEditors();
  }
  //#endregion

  //#region endleaves
  public addEndleaf(): void {
    const item: CodEndleaf = {
      location: '',
      material: this.matEntries?.length ? this.matEntries[0].id : '',
    };
    this.endleaves.setValue([...this.endleaves.value, item]);
    this.endleaves.updateValueAndValidity();
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

  public cloneEndleaf(index: number): void {
    const endleaves: CodEndleaf[] = [...this.endleaves.value];
    endleaves.splice(index, 0, deepCopy(endleaves[index]));
    this.endleaves.setValue(endleaves);
    this.endleaves.updateValueAndValidity();
    this.endleaves.markAsDirty();
  }

  public onEndleafSave(item: CodEndleaf): void {
    this.endleaves.setValue(
      this.endleaves.value.map((x: CodEndleaf, i: number) =>
        i === this._editedEndleafIndex ? item : x
      )
    );
    this.endleaves.updateValueAndValidity();
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
          this.endleaves.updateValueAndValidity();
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
    this.endleaves.updateValueAndValidity();
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
    this.endleaves.updateValueAndValidity();
    this.endleaves.markAsDirty();
  }
  //#endregion
}

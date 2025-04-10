import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Observable, take } from 'rxjs';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption, MatOptgroup } from '@angular/material/core';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';

import { deepCopy, FlatLookupPipe } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';

import { Flag } from '@myrmidon/cadmus-ui-flag-set';

import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  EditedObject,
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

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
import { CodNColDefinitionComponent } from '../cod-n-col-definition/cod-n-col-definition.component';
import { CodCColDefinitionComponent } from '../cod-c-col-definition/cod-c-col-definition.component';
import { CodSColDefinitionComponent } from '../cod-s-col-definition/cod-s-col-definition.component';
import { CodRColDefinitionComponent } from '../cod-r-col-definition/cod-r-col-definition.component';
import { CodLabelCellComponent } from '../cod-label-cell/cod-label-cell.component';
import { CodEndleafComponent } from '../cod-endleaf/cod-endleaf.component';

import { CellAdapterPipe } from './cell-adapter.pipe';
import { CellTypeColorPipe } from './cell-type-color.pipe';

// for mapping col features thesauri to flags
function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * CodSheetLabels part editor component.
 * Thesauri: cod-catchwords-positions, cod-numbering-systems,
 * cod-numbering-techniques, cod-numbering-positions,
 * cod-numbering-colors, cod-quiresig-systems,
 * cod-quiresig-positions, cod-endleaf-materials, chronotope-tags,
 * assertion-tags, doc-reference-types, doc-reference-tags,
 * asserted-id-scopes, asserted-id-tags, external-id-tags,
 * external-id-scopes, cod-labels-col-q-features,
 * cod-labels-col-n-features, cod-labels-col-c-features,
 * cod-labels-col-s-features, cod-labels-col-r-features (all optional).
 */
@Component({
  selector: 'cadmus-cod-sheet-labels-part',
  templateUrl: './cod-sheet-labels-part.component.html',
  styleUrls: ['./cod-sheet-labels-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatTabGroup,
    MatTab,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatIconButton,
    MatTooltip,
    MatInput,
    MatCheckbox,
    MatOptgroup,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    CodNColDefinitionComponent,
    CodCColDefinitionComponent,
    CodSColDefinitionComponent,
    CodRColDefinitionComponent,
    CodLabelCellComponent,
    MatButton,
    CodEndleafComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
    TitleCasePipe,
    AsyncPipe,
    FlatLookupPipe,
    CellAdapterPipe,
    CellTypeColorPipe,
  ],
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
  public note: FormControl<string | null>;

  public endleaves: FormControl<CodEndleaf[]>;
  public autoAppend: FormControl<boolean>;

  // C-COL
  // cod-catchwords-positions
  public poscEntries?: ThesaurusEntry[];
  // N-COL
  // cod-numbering-systems
  public sysnEntries?: ThesaurusEntry[];
  // cod-numbering-techniques
  public techEntries?: ThesaurusEntry[];
  // cod-numbering-positions
  public posnEntries?: ThesaurusEntry[];
  // cod-numbering-colors
  public clrEntries?: ThesaurusEntry[];
  // R/S-COL
  // cod-quiresig-systems
  public syssEntries?: ThesaurusEntry[];
  // cod-quiresig-positions
  public possEntries?: ThesaurusEntry[];
  // ENDLEAF
  // cod-endleaf-materials
  public matEntries?: ThesaurusEntry[];
  // chronotope-tags
  public ctTagEntries?: ThesaurusEntry[];
  // assertion-tags
  public assTagEntries?: ThesaurusEntry[];
  // doc-reference-types
  public refTypeEntries?: ThesaurusEntry[];
  // doc-reference-tags
  public refTagEntries?: ThesaurusEntry[];
  // LINKS
  // asserted-id-scopes
  public assIdScopeEntries?: ThesaurusEntry[];
  // asserted-id-tags
  public assIdTagEntries?: ThesaurusEntry[];
  // external-id-tags
  public idTagEntries?: ThesaurusEntry[];
  // external-id-scopes
  public idScopeEntries?: ThesaurusEntry[];
  // cod-labels-col-q-features
  public qFeatureEntries?: ThesaurusEntry[];
  // cod-labels-col-n-features
  public nFeatureEntries?: ThesaurusEntry[];
  // cod-labels-col-c-features
  public cFeatureEntries?: ThesaurusEntry[];
  // cod-labels-col-s-features
  public sFeatureEntries?: ThesaurusEntry[];
  // cod-labels-col-r-features
  public rFeatureEntries?: ThesaurusEntry[];

  // flags
  public qFeatureFlags?: Flag[];
  public nFeatureFlags?: Flag[];
  public cFeatureFlags?: Flag[];
  public sFeatureFlags?: Flag[];
  public rFeatureFlags?: Flag[];

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._table = new CodSheetTable();
    this._table.overflowDropping = true;

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
      Validators.pattern(LabelGenerator.ANY_PATTERN),
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
    this.note = formBuilder.control(null, Validators.maxLength(1000));

    this.endleaves = formBuilder.control([], { nonNullable: true });

    this.autoAppend = formBuilder.control(false, { nonNullable: true });
  }

  public override ngOnInit(): void {
    super.ngOnInit();

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
    this.autoAppend.valueChanges.subscribe((v) => {
      this._table.overflowDropping = v ? false : true;
    });
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      nDefs: this.nDefs,
      cDefs: this.cDefs,
      sDefs: this.sDefs,
      rDefs: this.rDefs,
      note: this.note,
      endleaves: this.endleaves,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-catchwords-positions';
    if (this.hasThesaurus(key)) {
      this.poscEntries = thesauri[key].entries;
    } else {
      this.poscEntries = undefined;
    }
    key = 'cod-numbering-systems';
    if (this.hasThesaurus(key)) {
      this.sysnEntries = thesauri[key].entries;
    } else {
      this.sysnEntries = undefined;
    }
    key = 'cod-numbering-techniques';
    if (this.hasThesaurus(key)) {
      this.techEntries = thesauri[key].entries;
    } else {
      this.techEntries = undefined;
    }
    key = 'cod-numbering-positions';
    if (this.hasThesaurus(key)) {
      this.posnEntries = thesauri[key].entries;
    } else {
      this.posnEntries = undefined;
    }
    key = 'cod-numbering-colors';
    if (this.hasThesaurus(key)) {
      this.clrEntries = thesauri[key].entries;
    } else {
      this.clrEntries = undefined;
    }
    key = 'cod-quiresig-systems';
    if (this.hasThesaurus(key)) {
      this.syssEntries = thesauri[key].entries;
    } else {
      this.syssEntries = undefined;
    }
    key = 'cod-quiresig-positions';
    if (this.hasThesaurus(key)) {
      this.possEntries = thesauri[key].entries;
    } else {
      this.possEntries = undefined;
    }
    key = 'cod-endleaf-materials';
    if (this.hasThesaurus(key)) {
      this.matEntries = thesauri[key].entries;
    } else {
      this.matEntries = undefined;
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
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.assIdScopeEntries = thesauri[key].entries;
    } else {
      this.assIdScopeEntries = undefined;
    }
    key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.assIdTagEntries = thesauri[key].entries;
    } else {
      this.assIdTagEntries = undefined;
    }
    key = 'external-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries = thesauri[key].entries;
    } else {
      this.idTagEntries = undefined;
    }
    key = 'external-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries = thesauri[key].entries;
    } else {
      this.idScopeEntries = undefined;
    }
    key = 'cod-labels-col-q-features';
    if (this.hasThesaurus(key)) {
      this.qFeatureEntries = thesauri[key].entries;
      this.qFeatureFlags = thesauri[key].entries?.map(entryToFlag);
    } else {
      this.qFeatureEntries = undefined;
      this.qFeatureFlags = undefined;
    }
    key = 'cod-labels-col-n-features';
    if (this.hasThesaurus(key)) {
      this.nFeatureEntries = thesauri[key].entries;
      this.qFeatureFlags = thesauri[key].entries?.map(entryToFlag);
    } else {
      this.nFeatureEntries = undefined;
      this.qFeatureFlags = undefined;
    }
    key = 'cod-labels-col-c-features';
    if (this.hasThesaurus(key)) {
      this.cFeatureEntries = thesauri[key].entries;
      this.cFeatureFlags = thesauri[key].entries?.map(entryToFlag);
    } else {
      this.cFeatureEntries = undefined;
      this.cFeatureFlags = undefined;
    }
    key = 'cod-labels-col-s-features';
    if (this.hasThesaurus(key)) {
      this.sFeatureEntries = thesauri[key].entries;
      this.sFeatureFlags = thesauri[key].entries?.map(entryToFlag);
    } else {
      this.sFeatureEntries = undefined;
      this.sFeatureFlags = undefined;
    }
    key = 'cod-labels-col-r-features';
    if (this.hasThesaurus(key)) {
      this.rFeatureEntries = thesauri[key].entries;
      this.rFeatureFlags = thesauri[key].entries?.map(entryToFlag);
    } else {
      this.rFeatureEntries = undefined;
      this.rFeatureFlags = undefined;
    }
  }

  private updateForm(part?: CodSheetLabelsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this._table.setRows(part.rows || []);
    this.nDefs.setValue(part.nDefinitions || []);
    this.cDefs.setValue(part.cDefinitions || []);
    this.sDefs.setValue(part.sDefinitions || []);
    this.rDefs.setValue(part.rDefinitions || []);
    this.note.setValue(part.note || null);
    this.endleaves.setValue(part.endleaves || []);

    // other values in UI
    this.qPresent = this._table.hasColumn('q');
    if (!this.addType.value) {
      this.addType.setValue('row-2');
    }

    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodSheetLabelsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodSheetLabelsPart {
    let part = this.getEditedPart(
      COD_SHEET_LABELS_PART_TYPEID
    ) as CodSheetLabelsPart;
    part.rows = this._table.getRows();
    part.nDefinitions = this.nDefs.value?.length ? this.nDefs.value : undefined;
    part.cDefinitions = this.cDefs.value?.length ? this.cDefs.value : undefined;
    part.sDefinitions = this.sDefs.value?.length ? this.sDefs.value : undefined;
    part.rDefinitions = this.rDefs.value?.length ? this.rDefs.value : undefined;
    part.note = this.note.value?.length ? this.note.value : undefined;
    part.endleaves = this.endleaves.value?.length
      ? this.endleaves.value
      : undefined;
    return part;
  }

  public onAction(): void {
    if (this.opForm.invalid) {
      return;
    }
    if (this.opAction.value?.includes(':=')) {
      const action = LabelGenerator.parseSetAction(this.opAction.value);
      if (!action) {
        return;
      }
      this._table.setPageValue(
        this._table.getColumnIndex(this.opColumn.value!),
        action.pages,
        action.value
      );
    } else {
      const cells = LabelGenerator.generateFrom(
        this.opColumn.value!,
        this.opAction.value!
      );
      this._table.addCells(cells);
    }
  }

  public onTypeAdd(): void {
    if (this.addForm.invalid) {
      return;
    }
    if (this.addType.value.startsWith('row-')) {
      let type: CodRowType;
      // count by 2 as operators work with sheets rather than pages
      let count = 2 * (this.addCount.value || 1);

      switch (this.addType.value) {
        case 'row-0':
          type = CodRowType.CoverFront;
          count = 1;
          break;
        case 'row-1':
          type = CodRowType.EndleafFront;
          break;
        case 'row-3':
          type = CodRowType.EndleafBack;
          break;
        case 'row-4':
          type = CodRowType.CoverBack;
          count = 1;
          break;
        default:
          type = CodRowType.Body;
          break;
      }
      this._table.appendRows(type, count);
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
      .confirm('Confirmation', 'Trim rows?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          this._table.trim();
        }
      });
  }

  public onTrimRowCols(): void {
    this._dialogService
      .confirm('Confirmation', 'Trim rows and columns?')
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

  public getColFeatureFlags(cellId?: string): Flag[] {
    if (!cellId?.length) {
      return [];
    }
    switch (cellId.charAt(0)) {
      case 'q':
        return this.qFeatureFlags || [];
      case 'n':
        return this.nFeatureFlags || [];
      case 'c':
        return this.cFeatureFlags || [];
      case 's':
        return this.sFeatureFlags || [];
      case 'r':
        return this.rFeatureFlags || [];
    }
    return [];
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
      // numbering
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
      // catchword
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
      // signature
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
          this._editedSDefIndex = sDefs.indexOf(sDef);
        }
        this.editedSDef = sDef;
        this.editedDefId = sDef.id;
        break;
      // register signature
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
          this._editedRDefIndex = rDefs.indexOf(rDef);
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
    this.editEndleaf({
      location: '',
      material: this.matEntries?.length ? this.matEntries[0].id : '',
    });
  }

  public editEndleaf(endleaf: CodEndleaf | null, index = -1): void {
    if (!endleaf) {
      this._editedEndleafIndex = -1;
      this.editedEndleaf = undefined;
    } else {
      this._editedEndleafIndex = index;
      this.editedEndleaf = endleaf;
    }
  }

  public cloneEndleaf(index: number): void {
    const endleaves: CodEndleaf[] = [...this.endleaves.value];
    endleaves.splice(index, 0, deepCopy(endleaves[index]));
    this.endleaves.setValue(endleaves);
    this.endleaves.updateValueAndValidity();
    this.endleaves.markAsDirty();
  }

  public onEndleafSave(endleaf: CodEndleaf): void {
    const endleaves = [...this.endleaves.value];

    if (this._editedEndleafIndex > -1) {
      endleaves.splice(this._editedEndleafIndex, 1, endleaf);
    } else {
      endleaves.push(endleaf);
    }

    this.endleaves.setValue(endleaves);
    this.endleaves.updateValueAndValidity();
    this.endleaves.markAsDirty();
    this.editEndleaf(null);
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

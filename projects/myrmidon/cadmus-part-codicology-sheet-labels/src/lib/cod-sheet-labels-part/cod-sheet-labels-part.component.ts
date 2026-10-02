import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import {
  disabled,
  form,
  FormField,
  maxLength,
  min,
  pattern,
  required,
} from '@angular/forms/signals';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Observable, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

import { FlatLookupPipe } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { Flag } from '@myrmidon/cadmus-ui-flag-set';

import { EditedObject, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  CodCColDefinition,
  CodEndleaf,
  CodNColDefinition,
  CodRColDefinition,
  CodSColDefinition,
  CodSheetLabelsPart,
  COD_SHEET_LABELS_PART_TYPEID,
  CodQuireDescription,
} from '../cod-sheet-labels-part';
import {
  CodLabelAction,
  CodLabelActionType,
  CodLabelCell,
  LabelGenerator,
} from '../label-generator';
import { CodRowType, CodRowViewModel, CodSheetTable } from '../cod-sheet-table';
import { CodNColDefinitionComponent } from '../cod-n-col-definition/cod-n-col-definition.component';
import { CodCColDefinitionComponent } from '../cod-c-col-definition/cod-c-col-definition.component';
import { CodSColDefinitionComponent } from '../cod-s-col-definition/cod-s-col-definition.component';
import { CodRColDefinitionComponent } from '../cod-r-col-definition/cod-r-col-definition.component';
import { CodLabelCellComponent } from '../cod-label-cell/cod-label-cell.component';
import { CodEndleafComponent } from '../cod-endleaf/cod-endleaf.component';

import { CellAdapterPipe } from './cell-adapter.pipe';
import { CellTypeColorPipe } from './cell-type-color.pipe';
import { CodQuireDescriptionComponent } from '../cod-quire-description/cod-quire-description.component';

// for mapping col features thesauri to flags
function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface CodSheetLabelsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

/**
 * The part's draft. The labels table is not here: it is edited through
 * its own model (CodSheetTable).
 */
interface CodSheetLabelsPartControls {
  quireDsc: CodQuireDescription | null;
  nDefs: CodNColDefinition[];
  cDefs: CodCColDefinition[];
  sDefs: CodSColDefinition[];
  rDefs: CodRColDefinition[];
  endleaves: CodEndleaf[];
}

function toDraft(part?: CodSheetLabelsPart | null): CodSheetLabelsPartControls {
  // copy: the form tags the objects in its arrays
  return {
    quireDsc: copyFormValue(part?.quireDescription) || null,
    nDefs: copyFormValue(part?.nDefinitions || []),
    cDefs: copyFormValue(part?.cDefinitions || []),
    sDefs: copyFormValue(part?.sDefinitions || []),
    rDefs: copyFormValue(part?.rDefinitions || []),
    endleaves: copyFormValue(part?.endleaves || []),
  };
}

/**
 * The operation sub-form: it is not part of the edited part.
 */
interface CodSheetOperationControls {
  opColumn: string | null;
  opAction: string;
  autoAppend: boolean;
}

/**
 * The column/rows adder sub-form: it is not part of the edited part.
 */
interface CodSheetAdderControls {
  addType: string;
  addName: string;
  addCount: number | null;
}

function isQuireDscEmpty(quireDsc: CodQuireDescription | null): boolean {
  return (
    !quireDsc ||
    (!quireDsc.features?.length &&
      !quireDsc.note &&
      (!quireDsc.scopedNotes || !Object.keys(quireDsc.scopedNotes).length))
  );
}

/**
 * CodSheetLabels part editor component.
 * Thesauri: cod-catchwords-positions, cod-numbering-systems,
 * cod-numbering-techniques, cod-numbering-positions,
 * cod-numbering-colors, cod-quiresig-systems, cod-quire-features,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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
    CodQuireDescriptionComponent,
    HelpLinkComponent,
  ],
})
export class CodSheetLabelsPartComponent extends ModelEditorComponentBase<CodSheetLabelsPart> {
  private readonly _dialogService = inject(DialogService);
  private readonly _table: CodSheetTable;
  private _editedEndleafIndex = -1;
  private _editedNDefIndex = -1;
  private _editedCDefIndex = -1;
  private _editedSDefIndex = -1;
  private _editedRDefIndex = -1;

  public readonly maxQuireNumber = signal<number>(0);
  public readonly editedNDef = signal<CodNColDefinition | undefined>(undefined);
  public readonly editedCDef = signal<CodCColDefinition | undefined>(undefined);
  public readonly editedSDef = signal<CodSColDefinition | undefined>(undefined);
  public readonly editedRDef = signal<CodRColDefinition | undefined>(undefined);
  public readonly editedDefId = signal<string | undefined>(undefined);
  public readonly editedEndleaf = signal<CodEndleaf | undefined>(undefined);

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  public columns$: Observable<string[]>;
  public rows$: Observable<CodRowViewModel[]>;

  public readonly endleafRowIds = signal<string[]>([]);
  public readonly qPresent = signal<boolean>(false);

  // the part's form
  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft);

  // the operation sub-form
  public readonly opForm = form(
    signal<CodSheetOperationControls>({
      opColumn: null,
      opAction: '',
      autoAppend: false,
    }),
    (p) => {
      required(p.opColumn);
      required(p.opAction);
      pattern(p.opAction, LabelGenerator.ANY_PATTERN);
    },
  );

  // the adder sub-form
  public readonly addForm = form(
    signal<CodSheetAdderControls>({
      addType: 'row-2',
      addName: '',
      addCount: 1,
    }),
    (p) => {
      required(p.addType);
      maxLength(p.addName, 50);
      min(p.addCount, 1);
      disabled(p.addName, () => this.isColQ());
    },
  );

  public readonly adderColumn = computed<boolean>(() =>
    this.addForm.addType().value().startsWith('col'),
  );
  public readonly isColQ = computed<boolean>(
    () => this.addForm.addType().value() === 'col-q',
  );

  // C-COL
  // cod-catchwords-positions
  public readonly poscEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-catchwords-positions']?.entries,
  );
  // N-COL
  // cod-numbering-systems
  public readonly sysnEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-numbering-systems']?.entries,
  );
  // cod-numbering-techniques
  public readonly techEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-numbering-techniques']?.entries,
  );
  // cod-numbering-positions
  public readonly posnEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-numbering-positions']?.entries,
  );
  // cod-numbering-colors
  public readonly clrEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-numbering-colors']?.entries,
  );
  // R/S-COL
  // cod-quire-features
  public readonly quireFeatEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-quire-features']?.entries,
  );
  // cod-quiresig-systems
  public readonly syssEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-quiresig-systems']?.entries,
  );
  // cod-quiresig-positions
  public readonly possEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-quiresig-positions']?.entries,
  );
  // ENDLEAF
  // cod-endleaf-materials
  public readonly matEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-endleaf-materials']?.entries,
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
  // LINKS
  // asserted-id-scopes
  public readonly assIdScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-scopes']?.entries,
  );
  // asserted-id-tags
  public readonly assIdTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-tags']?.entries,
  );
  // external-id-tags
  public readonly idTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-tags']?.entries,
  );
  // external-id-scopes
  public readonly idScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-scopes']?.entries,
  );
  // cod-labels-col-q-features
  public readonly qFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-labels-col-q-features']?.entries,
  );
  // cod-labels-col-n-features
  public readonly nFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-labels-col-n-features']?.entries,
  );
  // cod-labels-col-c-features
  public readonly cFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-labels-col-c-features']?.entries,
  );
  // cod-labels-col-s-features
  public readonly sFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-labels-col-s-features']?.entries,
  );
  // cod-labels-col-r-features
  public readonly rFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-labels-col-r-features']?.entries,
  );

  // flags
  public readonly qFeatureFlags = computed<Flag[]>(() => {
    return this.qFeatureEntries()?.map(entryToFlag) ?? [];
  });
  public readonly nFeatureFlags = computed<Flag[]>(() => {
    return this.nFeatureEntries()?.map(entryToFlag) ?? [];
  });
  public readonly cFeatureFlags = computed<Flag[]>(() => {
    return this.cFeatureEntries()?.map(entryToFlag) ?? [];
  });
  public readonly sFeatureFlags = computed<Flag[]>(() => {
    return this.sFeatureEntries()?.map(entryToFlag) ?? [];
  });
  public readonly rFeatureFlags = computed<Flag[]>(() => {
    return this.rFeatureEntries()?.map(entryToFlag) ?? [];
  });

  constructor() {
    super();
    this._table = new CodSheetTable();
    this._table.overflowDropping = true;

    this.columns$ = this._table.columnIds$;
    this.rows$ = this._table.rows$;

    this.initSettings<CodSheetLabelsPartSettings>(
      COD_SHEET_LABELS_PART_TYPEID,
      (settings) =>
        this.lookupProviderOptions.set(
          settings?.lookupProviderOptions || undefined,
        ),
    );

    this.rows$.pipe(takeUntilDestroyed()).subscribe((rows) => {
      this.endleafRowIds.set([
        ...new Set(
          rows
            .filter((r) => r.id.startsWith('('))
            .map((r) => r.id.replace(/[rv]\)/, ')')),
        ),
      ]);
    });

    // rows are appended when labels overflow, unless dropping them
    effect(() => {
      this._table.overflowDropping = !this.opForm.autoAppend().value();
    });
  }

  /**
   * Load the labels table from new data: the table is edited through its
   * own model, rather than by the form.
   */
  protected override onDataSet(data?: EditedObject<CodSheetLabelsPart>): void {
    const part = data?.value;
    if (!part) {
      return;
    }
    this._table.setRows(part.rows || []);

    // other values in UI
    this.qPresent.set(this._table.hasColumn('q'));
    if (!this.addForm.addType().value()) {
      this.addForm.addType().value.set('row-2');
    }
  }

  private pruneQuireDescription(
    quireDsc: CodQuireDescription,
  ): CodQuireDescription {
    const max = this._table.getMaxQuireNumber();

    // remove all quire scoped notes with number > max
    const pruned = copyFormValue(quireDsc);
    if (pruned.scopedNotes) {
      for (const key of Object.keys(pruned.scopedNotes)) {
        const n = parseInt(key);
        if (n > max) {
          delete pruned.scopedNotes[n];
        }
      }
    }
    return pruned;
  }

  protected getValue(): CodSheetLabelsPart {
    const part = this.getEditedPart(
      COD_SHEET_LABELS_PART_TYPEID,
    ) as CodSheetLabelsPart;
    const draft = this._draft();
    part.rows = this._table.getRows();
    part.quireDescription = isQuireDscEmpty(draft.quireDsc)
      ? undefined
      : this.pruneQuireDescription(draft.quireDsc!);
    part.nDefinitions = draft.nDefs.length
      ? copyFormValue(draft.nDefs)
      : undefined;
    part.cDefinitions = draft.cDefs.length
      ? copyFormValue(draft.cDefs)
      : undefined;
    part.sDefinitions = draft.sDefs.length
      ? copyFormValue(draft.sDefs)
      : undefined;
    part.rDefinitions = draft.rDefs.length
      ? copyFormValue(draft.rDefs)
      : undefined;
    part.endleaves = draft.endleaves.length
      ? copyFormValue(draft.endleaves)
      : undefined;
    return part;
  }

  /**
   * Run the operation on Enter in its input, if valid.
   */
  public onActionEnterKey(event: Event): void {
    event.preventDefault();
    if (this.opForm().valid()) {
      this.onAction();
    }
  }

  /**
   * Add on Enter in an adder input, if valid.
   */
  public onAddEnterKey(event: Event): void {
    event.preventDefault();
    if (this.addForm().valid()) {
      this.onTypeAdd();
    }
  }

  public onAction(): void {
    if (this.opForm().invalid()) {
      return;
    }
    const op = this.opForm().value();
    if (op.opAction.includes(':=')) {
      const action = LabelGenerator.parseSetAction(op.opAction);
      if (!action) {
        return;
      }
      const cells = LabelGenerator.generateSet(op.opColumn!, action);
      this._table.setCells(cells);
      this.form().markAsDirty();
    } else {
      const action = LabelGenerator.parseAction(
        op.opAction,
      ) as CodLabelAction | null;
      if (!action) {
        return;
      }
      const cells = LabelGenerator.generate(op.opColumn!, action);
      // quires always append missing rows, as they define the sheets
      // structure; other labels follow the auto-append option
      this._table.addCells(
        cells,
        action.type === CodLabelActionType.Quire ? true : undefined,
      );
      this.form().markAsDirty();
    }
  }

  public onTypeAdd(): void {
    if (this.addForm().invalid()) {
      return;
    }
    const add = this.addForm().value();
    if (add.addType.startsWith('row-')) {
      let type: CodRowType;
      // count by 2 as operators work with sheets rather than pages
      let count = 2 * (add.addCount || 1);

      switch (add.addType) {
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
      this.form().markAsDirty();
    } else {
      // the name is not used for quires
      const name = this.isColQ() ? '' : add.addName;
      const id = add.addType.charAt(4) + (name ? '.' + name : '');
      this._table.addColumn(id);
      this.form().markAsDirty();
      if (id.charAt(0) === 'q') {
        this.qPresent.set(true);
      }
      this.opForm.opColumn().value.set(id);
    }
  }

  public onClearColumn(): void {
    if (!this.opForm.opColumn().value()) {
      return;
    }
    this._dialogService
      .confirm('Confirmation', `Clear column ${this.opForm.opColumn().value()}?`)
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          this._table.clearColumnValues(this.opForm.opColumn().value()!);
          this.form().markAsDirty();
        }
      });
  }

  public onDeleteColumn(): void {
    if (!this.opForm.opColumn().value()) {
      return;
    }
    this._dialogService
      .confirm('Confirmation', `Delete column ${this.opForm.opColumn().value()}?`)
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          this._table.deleteColumn(this.opForm.opColumn().value()!);
          this.form().markAsDirty();
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
          this.form().markAsDirty();
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
          this.form().markAsDirty();
        }
      });
  }

  public onCellChange(cell: CodLabelCell): void {
    // cell was edited, update it
    this._table.updateCell(cell);
    this.form().markAsDirty();
  }

  public getColFeatureFlags(cellId?: string): Flag[] {
    if (!cellId?.length) {
      return [];
    }
    switch (cellId.charAt(0)) {
      case 'q':
        return this.qFeatureFlags() || [];
      case 'n':
        return this.nFeatureFlags() || [];
      case 'c':
        return this.cFeatureFlags() || [];
      case 's':
        return this.sFeatureFlags() || [];
      case 'r':
        return this.rFeatureFlags() || [];
    }
    return [];
  }

  //#region definitions
  private getDefaultEntryId(entries: ThesaurusEntry[] | undefined): string {
    return entries?.length ? entries[0].id : '';
  }

  private closeAllDefEditors(): void {
    this.editedDefId.set(undefined);

    this.editedNDef.set(undefined);
    this._editedNDefIndex = -1;

    this.editedCDef.set(undefined);
    this._editedCDefIndex = -1;

    this.editedSDef.set(undefined);
    this._editedSDefIndex = -1;

    this.editedRDef.set(undefined);
    this._editedRDefIndex = -1;
  }

  public onEditColumnDefinition(): void {
    const column = this.opForm.opColumn().value();
    if (!column) {
      return;
    }

    this.closeAllDefEditors();

    switch (column.charAt(0)) {
      // quire
      case 'q':
        this.maxQuireNumber.set(this._table.getMaxQuireNumber());
        this.editedDefId.set('q');
        break;
      // numbering
      case 'n':
        const nDefs = this.form.nDefs().value() as CodNColDefinition[];
        let nDef = nDefs.find((d) => d.id === column);
        if (!nDef) {
          nDef = {
            id: column,
            rank: 0,
            system: this.getDefaultEntryId(this.sysnEntries()),
            technique: this.getDefaultEntryId(this.techEntries()),
            position: this.getDefaultEntryId(this.posnEntries()),
          };
        } else {
          this._editedNDefIndex = nDefs.indexOf(nDef);
        }
        this.editedNDef.set(nDef);
        this.editedDefId.set(nDef.id);
        break;
      // catchword
      case 'c':
        const cDefs = this.form.cDefs().value() as CodCColDefinition[];
        let cDef = cDefs.find((d) => d.id === column);
        if (!cDef) {
          cDef = {
            id: column,
            rank: 0,
            position: this.getDefaultEntryId(this.poscEntries()),
          };
        } else {
          this._editedCDefIndex = cDefs.indexOf(cDef);
        }
        this.editedCDef.set(cDef);
        this.editedDefId.set(cDef.id);
        break;
      // signature
      case 's':
        const sDefs = this.form.sDefs().value() as CodSColDefinition[];
        let sDef = sDefs.find((d) => d.id === column);
        if (!sDef) {
          sDef = {
            id: column,
            rank: 0,
            system: this.getDefaultEntryId(this.syssEntries()),
            position: this.getDefaultEntryId(this.possEntries()),
          };
        } else {
          this._editedSDefIndex = sDefs.indexOf(sDef);
        }
        this.editedSDef.set(sDef);
        this.editedDefId.set(sDef.id);
        break;
      // register signature
      case 'r':
        const rDefs = this.form.rDefs().value() as CodRColDefinition[];
        let rDef = rDefs.find((d) => d.id === column);
        if (!rDef) {
          rDef = {
            id: column,
            rank: 0,
            position: this.getDefaultEntryId(this.possEntries()),
          };
        } else {
          this._editedRDefIndex = rDefs.indexOf(rDef);
        }
        this.editedRDef.set(rDef);
        this.editedDefId.set(rDef.id);
        break;
    }
  }

  public saveQuireDsc(quireDsc: CodQuireDescription): void {
    this.form.quireDsc().value.set(copyFormValue(quireDsc));
    this.form.quireDsc().markAsDirty();
    this.onColumnDefClose();
  }

  public onColumnDefClose(): void {
    this.closeAllDefEditors();
  }

  public onEditedNDefChange(def: CodNColDefinition): void {
    const defs = [...this.form.nDefs().value()];
    if (this._editedNDefIndex === -1) {
      defs.push(def);
    } else {
      defs.splice(this._editedNDefIndex, 1, def);
    }
    this.form.nDefs().value.set(defs);
    this.form.nDefs().markAsDirty();
    this.closeAllDefEditors();
  }

  public onEditedCDefChange(def: CodCColDefinition): void {
    const defs = [...this.form.cDefs().value()];
    if (this._editedCDefIndex === -1) {
      defs.push(def);
    } else {
      defs.splice(this._editedCDefIndex, 1, def);
    }
    this.form.cDefs().value.set(defs);
    this.form.cDefs().markAsDirty();
    this.closeAllDefEditors();
  }

  public onEditedSDefChange(def: CodSColDefinition): void {
    const defs = [...this.form.sDefs().value()];
    if (this._editedSDefIndex === -1) {
      defs.push(def);
    } else {
      defs.splice(this._editedSDefIndex, 1, def);
    }
    this.form.sDefs().value.set(defs);
    this.form.sDefs().markAsDirty();
    this.closeAllDefEditors();
  }

  public onEditedRDefChange(def: CodRColDefinition): void {
    const defs = [...this.form.rDefs().value()];
    if (this._editedRDefIndex === -1) {
      defs.push(def);
    } else {
      defs.splice(this._editedRDefIndex, 1, def);
    }
    this.form.rDefs().value.set(defs);
    this.form.rDefs().markAsDirty();
    this.closeAllDefEditors();
  }
  //#endregion

  //#region endleaves
  public addEndleaf(): void {
    this.editEndleaf({
      location: '',
      material: this.matEntries()?.length ? this.matEntries()![0].id : '',
    });
  }

  public editEndleaf(endleaf: CodEndleaf | null, index = -1): void {
    if (!endleaf) {
      this._editedEndleafIndex = -1;
      this.editedEndleaf.set(undefined);
    } else {
      this._editedEndleafIndex = index;
      this.editedEndleaf.set(structuredClone(endleaf));
    }
  }

  public cloneEndleaf(index: number): void {
    const endleaves: CodEndleaf[] = [...this.form.endleaves().value()];
    endleaves.splice(index, 0, structuredClone(endleaves[index]));
    this.form.endleaves().value.set(endleaves);
    this.form.endleaves().markAsDirty();
  }

  public onEndleafSave(endleaf: CodEndleaf): void {
    const endleaves = [...this.form.endleaves().value()];

    if (this._editedEndleafIndex > -1) {
      endleaves.splice(this._editedEndleafIndex, 1, endleaf);
    } else {
      endleaves.push(endleaf);
    }

    this.form.endleaves().value.set(endleaves);
    this.form.endleaves().markAsDirty();
    this.editEndleaf(null);
  }

  public deleteEndleaf(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete endleaf?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const items = [...this.form.endleaves().value()];
          items.splice(index, 1);
          this.form.endleaves().value.set(items);
          this.form.endleaves().markAsDirty();
        }
      });
  }

  public moveEndleafUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.form.endleaves().value()[index];
    const items = [...this.form.endleaves().value()];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.form.endleaves().value.set(items);
    this.form.endleaves().markAsDirty();
  }

  public moveEndleafDown(index: number): void {
    if (index + 1 >= this.form.endleaves().value().length) {
      return;
    }
    const item = this.form.endleaves().value()[index];
    const items = [...this.form.endleaves().value()];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.form.endleaves().value.set(items);
    this.form.endleaves().markAsDirty();
  }
  //#endregion
}

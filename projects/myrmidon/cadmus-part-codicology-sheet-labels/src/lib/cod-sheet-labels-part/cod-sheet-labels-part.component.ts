import { Component, computed, signal } from '@angular/core';
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

import { deepCopy, FlatLookupPipe } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';

import { Flag } from '@myrmidon/cadmus-ui-flag-set';

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
  CodCColDefinition,
  CodEndleaf,
  CodNColDefinition,
  CodRColDefinition,
  CodSColDefinition,
  CodSheetLabelsPart,
  COD_SHEET_LABELS_PART_TYPEID,
  CodQuireDescription,
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
    CodQuireDescriptionComponent,
  ],
})
export class CodSheetLabelsPartComponent extends ModelEditorComponentBase<CodSheetLabelsPart> {
  private _table: CodSheetTable;
  private _editedEndleafIndex;
  private _editedNDefIndex;
  private _editedCDefIndex;
  private _editedSDefIndex;
  private _editedRDefIndex;

  public readonly quireDsc = signal<CodQuireDescription | undefined>(undefined);
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

  public opColumn: FormControl<string | null>;
  public opAction: FormControl<string | null>;
  public opForm: FormGroup;

  public addType: FormControl<string>;
  public addName: FormControl<string | null>;
  public addCount: FormControl<number>;
  public addForm: FormGroup;

  public readonly adderColumn = signal<boolean>(false);
  public readonly isColQ = signal<boolean>(false);

  public nDefs: FormControl<CodNColDefinition[]>;
  public cDefs: FormControl<CodCColDefinition[]>;
  public sDefs: FormControl<CodSColDefinition[]>;
  public rDefs: FormControl<CodRColDefinition[]>;

  public endleaves: FormControl<CodEndleaf[]>;
  public autoAppend: FormControl<boolean>;

  // C-COL
  // cod-catchwords-positions
  public readonly poscEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // N-COL
  // cod-numbering-systems
  public readonly sysnEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-numbering-techniques
  public readonly techEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-numbering-positions
  public readonly posnEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-numbering-colors
  public readonly clrEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // R/S-COL
  // cod-quire-features
  public readonly quireFeatEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-quiresig-systems
  public readonly syssEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-quiresig-positions
  public readonly possEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // ENDLEAF
  // cod-endleaf-materials
  public readonly matEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // chronotope-tags
  public readonly ctTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // doc-reference-types
  public readonly refTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // doc-reference-tags
  public readonly refTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // LINKS
  // asserted-id-scopes
  public readonly assIdScopeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // asserted-id-tags
  public readonly assIdTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // external-id-tags
  public readonly idTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // external-id-scopes
  public readonly idScopeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-labels-col-q-features
  public readonly qFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-labels-col-n-features
  public readonly nFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-labels-col-c-features
  public readonly cFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-labels-col-s-features
  public readonly sFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-labels-col-r-features
  public readonly rFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
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

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
    super(authService, formBuilder);
    this._table = new CodSheetTable();
    this._table.overflowDropping = true;

    this.columns$ = this._table.columnIds$;
    this.rows$ = this._table.rows$;

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

    this.endleaves = formBuilder.control([], { nonNullable: true });

    this.autoAppend = formBuilder.control(false, { nonNullable: true });

    // subscriptions
    this.addType.valueChanges.pipe(takeUntilDestroyed()).subscribe((v) => {
      this.adderColumn.set(v && (v as string).startsWith('col') ? true : false);
      const isColQ = v === 'col-q';
      this.isColQ.set(isColQ);
      if (isColQ) {
        this.addName.disable();
      } else {
        this.addName.enable();
      }
    });

    this.rows$.pipe(takeUntilDestroyed()).subscribe((rows) => {
      console.log(
        '[CodSheetLabels] rows$ subscription triggered, row count:',
        rows.length,
      );
      this.endleafRowIds.set([
        ...new Set(
          rows
            .filter((r) => r.id.startsWith('('))
            .map((r) => r.id.replace(/[rv]\)/, ')')),
        ),
      ]);
    });

    this.autoAppend.valueChanges.pipe(takeUntilDestroyed()).subscribe((v) => {
      this._table.overflowDropping = v ? false : true;
    });
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      nDefs: this.nDefs,
      cDefs: this.cDefs,
      sDefs: this.sDefs,
      rDefs: this.rDefs,
      endleaves: this.endleaves,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-catchwords-positions';
    if (this.hasThesaurus(key)) {
      this.poscEntries.set(thesauri[key].entries);
    } else {
      this.poscEntries.set(undefined);
    }
    key = 'cod-numbering-systems';
    if (this.hasThesaurus(key)) {
      this.sysnEntries.set(thesauri[key].entries);
    } else {
      this.sysnEntries.set(undefined);
    }
    key = 'cod-numbering-techniques';
    if (this.hasThesaurus(key)) {
      this.techEntries.set(thesauri[key].entries);
    } else {
      this.techEntries.set(undefined);
    }
    key = 'cod-numbering-positions';
    if (this.hasThesaurus(key)) {
      this.posnEntries.set(thesauri[key].entries);
    } else {
      this.posnEntries.set(undefined);
    }
    key = 'cod-numbering-colors';
    if (this.hasThesaurus(key)) {
      this.clrEntries.set(thesauri[key].entries);
    } else {
      this.clrEntries.set(undefined);
    }
    key = 'cod-quire-features';
    if (this.hasThesaurus(key)) {
      this.quireFeatEntries.set(thesauri[key].entries);
    } else {
      this.quireFeatEntries.set(undefined);
    }
    key = 'cod-quiresig-systems';
    if (this.hasThesaurus(key)) {
      this.syssEntries.set(thesauri[key].entries);
    } else {
      this.syssEntries.set(undefined);
    }
    key = 'cod-quiresig-positions';
    if (this.hasThesaurus(key)) {
      this.possEntries.set(thesauri[key].entries);
    } else {
      this.possEntries.set(undefined);
    }
    key = 'cod-endleaf-materials';
    if (this.hasThesaurus(key)) {
      this.matEntries.set(thesauri[key].entries);
    } else {
      this.matEntries.set(undefined);
    }
    key = 'chronotope-tags';
    if (this.hasThesaurus(key)) {
      this.ctTagEntries.set(thesauri[key].entries);
    } else {
      this.ctTagEntries.set(undefined);
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.refTypeEntries.set(thesauri[key].entries);
    } else {
      this.refTypeEntries.set(undefined);
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries.set(thesauri[key].entries);
    } else {
      this.refTagEntries.set(undefined);
    }
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.assIdScopeEntries.set(thesauri[key].entries);
    } else {
      this.assIdScopeEntries.set(undefined);
    }
    key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.assIdTagEntries.set(thesauri[key].entries);
    } else {
      this.assIdTagEntries.set(undefined);
    }
    key = 'external-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries.set(thesauri[key].entries);
    } else {
      this.idTagEntries.set(undefined);
    }
    key = 'external-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries.set(thesauri[key].entries);
    } else {
      this.idScopeEntries.set(undefined);
    }
    key = 'cod-labels-col-q-features';
    if (this.hasThesaurus(key)) {
      this.qFeatureEntries.set(thesauri[key].entries);
    } else {
      this.qFeatureEntries.set(undefined);
    }
    key = 'cod-labels-col-n-features';
    if (this.hasThesaurus(key)) {
      this.nFeatureEntries.set(thesauri[key].entries);
    } else {
      this.nFeatureEntries.set(undefined);
    }
    key = 'cod-labels-col-c-features';
    if (this.hasThesaurus(key)) {
      this.cFeatureEntries.set(thesauri[key].entries);
    } else {
      this.cFeatureEntries.set(undefined);
    }
    key = 'cod-labels-col-s-features';
    if (this.hasThesaurus(key)) {
      this.sFeatureEntries.set(thesauri[key].entries);
    } else {
      this.sFeatureEntries.set(undefined);
    }
    key = 'cod-labels-col-r-features';
    if (this.hasThesaurus(key)) {
      this.rFeatureEntries.set(thesauri[key].entries);
    } else {
      this.rFeatureEntries.set(undefined);
    }
  }

  private isQuireDscEmpty(): boolean {
    return (
      !this.quireDsc() ||
      (!this.quireDsc()?.features?.length &&
        !this.quireDsc()?.note &&
        (!this.quireDsc()?.scopedNotes ||
          !Object.keys(this.quireDsc()?.scopedNotes || {}).length))
    );
  }

  private updateForm(part?: CodSheetLabelsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this._table.setRows(part.rows || []);
    this.quireDsc.set(part.quireDescription);
    this.nDefs.setValue(part.nDefinitions || []);
    this.cDefs.setValue(part.cDefinitions || []);
    this.sDefs.setValue(part.sDefinitions || []);
    this.rDefs.setValue(part.rDefinitions || []);
    this.endleaves.setValue(part.endleaves || []);

    // other values in UI
    this.qPresent.set(this._table.hasColumn('q'));
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
    // settings
    this._appRepository
      ?.getSettingFor<CodSheetLabelsPartSettings>(
        COD_SHEET_LABELS_PART_TYPEID,
        this.identity()?.roleId || undefined,
      )
      .then((settings) => {
        const options = settings?.lookupProviderOptions;
        this.lookupProviderOptions.set(options || undefined);
      });
    // form
    this.updateForm(data?.value);
  }

  private pruneQuireDescription(): CodQuireDescription | undefined {
    const max = this._table.getMaxQuireNumber();

    // remove all quire scoped notes with number > max
    const quireDsc = { ...this.quireDsc() };
    if (quireDsc?.scopedNotes) {
      for (const key of Object.keys(quireDsc.scopedNotes || {})) {
        const n = parseInt(key);
        if (n > max) {
          delete quireDsc.scopedNotes![n];
        }
      }
    }
    this.quireDsc.set(quireDsc);
    return this.quireDsc();
  }

  protected getValue(): CodSheetLabelsPart {
    let part = this.getEditedPart(
      COD_SHEET_LABELS_PART_TYPEID,
    ) as CodSheetLabelsPart;
    part.rows = this._table.getRows();
    part.quireDescription = this.isQuireDscEmpty()
      ? undefined
      : this.pruneQuireDescription();
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
    console.log('[CodSheetLabels] onAction START');
    if (this.opForm.invalid) {
      return;
    }
    if (this.opAction.value?.includes(':=')) {
      const action = LabelGenerator.parseSetAction(this.opAction.value);
      if (!action) {
        return;
      }
      console.log('[CodSheetLabels] setPageValue action');
      this._table.setPageValue(
        this._table.getColumnIndex(this.opColumn.value!),
        action.pages,
        action.value,
      );
    } else {
      const cells = LabelGenerator.generateFrom(
        this.opColumn.value!,
        this.opAction.value!,
      );
      console.log(
        '[CodSheetLabels] addCells action, cells count:',
        cells.length,
      );
      this._table.addCells(cells);
    }
    console.log('[CodSheetLabels] onAction END');
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
        this.qPresent.set(true);
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
    if (!this.opColumn.value) {
      return;
    }

    this.closeAllDefEditors();

    switch (this.opColumn.value.charAt(0)) {
      // quire
      case 'q':
        this.maxQuireNumber.set(this._table.getMaxQuireNumber());
        this.editedDefId.set('q');
        break;
      // numbering
      case 'n':
        const nDefs = this.nDefs.value as CodNColDefinition[];
        let nDef = nDefs.find((d) => d.id === this.opColumn.value);
        if (!nDef) {
          nDef = {
            id: this.opColumn.value,
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
        const cDefs = this.cDefs.value as CodCColDefinition[];
        let cDef = cDefs.find((d) => d.id === this.opColumn.value);
        if (!cDef) {
          cDef = {
            id: this.opColumn.value,
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
        const sDefs = this.sDefs.value as CodSColDefinition[];
        let sDef = sDefs.find((d) => d.id === this.opColumn.value);
        if (!sDef) {
          sDef = {
            id: this.opColumn.value,
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
        const rDefs = this.rDefs.value as CodRColDefinition[];
        let rDef = rDefs.find((d) => d.id === this.opColumn.value);
        if (!rDef) {
          rDef = {
            id: this.opColumn.value,
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
    this.quireDsc.set(quireDsc);
    this.onColumnDefClose();
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
      material: this.matEntries()?.length ? this.matEntries()![0].id : '',
    });
  }

  public editEndleaf(endleaf: CodEndleaf | null, index = -1): void {
    if (!endleaf) {
      this._editedEndleafIndex = -1;
      this.editedEndleaf.set(undefined);
    } else {
      this._editedEndleafIndex = index;
      this.editedEndleaf.set(endleaf);
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

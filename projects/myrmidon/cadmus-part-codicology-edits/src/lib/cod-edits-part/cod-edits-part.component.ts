import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { take } from 'rxjs/operators';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltip } from '@angular/material/tooltip';

import {
  NgxToolsSignalValidators,
  EllipsisPipe,
  FlatLookupPipe,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  CodEdit,
  CodEditsPart,
  COD_EDITS_PART_TYPEID,
} from '../cod-edits-part';
import { CodEditEditorComponent } from '../cod-edit-editor/cod-edit-editor.component';

interface CodEditsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

interface CodEditsPartControls {
  edits: CodEdit[];
}

function toDraft(part?: CodEditsPart | null): CodEditsPartControls {
  // copy: the form tags the objects in its arrays
  return { edits: copyFormValue(part?.edits || []) };
}

/**
 * CodEditsPart editor component.
 * Thesauri: cod-edit-colors, cod-edit-techniques, cod-edit-types,
 * cod-edit-tags, cod-edit-languages, doc-reference-types,
 * doc-reference-tags, assertion-tags, external-id-tags,
 * external-id-scopes, cod-edit-positions.
 */
@Component({
  selector: 'cadmus-cod-edits-part',
  templateUrl: './cod-edits-part.component.html',
  styleUrls: ['./cod-edits-part.component.css'],
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
    CodEditEditorComponent,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    EllipsisPipe,
    FlatLookupPipe,
    CodLocationRangePipe,
    HelpLinkComponent,
  ],
})
export class CodEditsPartComponent
  extends ModelEditorComponentBase<CodEditsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly editedEdit = signal<CodEdit | undefined>(undefined);

  // cod-edit-colors
  public readonly colorEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-edit-colors']?.entries,
  );
  // cod-edit-techniques
  public readonly techEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-edit-techniques']?.entries,
  );
  // cod-edit-types
  public readonly typeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-edit-types']?.entries,
  );
  // cod-edit-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-edit-tags']?.entries,
  );
  // cod-edit-positions
  public readonly posEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-edit-positions']?.entries,
  );
  // cod-edit-languages
  public readonly langEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-edit-languages']?.entries,
  );
  // doc-reference-types
  public readonly refTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly refTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );
  // assertion-tags
  public readonly assTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['assertion-tags']?.entries,
  );
  // external-id-tags
  public readonly idTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-tags']?.entries,
  );
  // external-id-scopes
  public readonly idScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-scopes']?.entries,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);


  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.edits, 1);
  });

  constructor() {
    super();
    this.initSettings<CodEditsPartSettings>(COD_EDITS_PART_TYPEID, (settings) =>
      this.lookupProviderOptions.set(settings?.lookupProviderOptions || undefined),
    );
  }

  protected getValue(): CodEditsPart {
    const part = this.getEditedPart(COD_EDITS_PART_TYPEID) as CodEditsPart;
    part.edits = copyFormValue(this._draft().edits);
    return part;
  }

  private setEdits(edits: CodEdit[]): void {
    this.form.edits().value.set(edits);
    this.form.edits().markAsDirty();
  }

  public addEdit(): void {
    this.editEdit({
      type: this.typeEntries()?.length ? this.typeEntries()![0].id : '',
      ranges: [],
    });
  }

  public editEdit(edit: CodEdit | null, index = -1): void {
    if (!edit) {
      this.editedIndex.set(-1);
      this.editedEdit.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedEdit.set(structuredClone(edit));
    }
  }

  public onEditChange(edit: CodEdit): void {
    const edits = [...this.form.edits().value()];

    if (this.editedIndex() > -1) {
      edits.splice(this.editedIndex(), 1, edit);
    } else {
      edits.push(edit);
    }

    this.setEdits(edits);
    this.editEdit(null);
  }

  public deleteEdit(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete edit?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.form.edits().value()];
          entries.splice(index, 1);
          this.setEdits(entries);
        }
      });
  }

  public moveEditUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.form.edits().value()[index];
    const entries = [...this.form.edits().value()];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.setEdits(entries);
  }

  public moveEditDown(index: number): void {
    if (index + 1 >= this.form.edits().value().length) {
      return;
    }
    const entry = this.form.edits().value()[index];
    const entries = [...this.form.edits().value()];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.setEdits(entries);
  }
}

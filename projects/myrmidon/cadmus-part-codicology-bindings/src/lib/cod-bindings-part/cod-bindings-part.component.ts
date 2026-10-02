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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { NgxToolsSignalValidators, FlatLookupPipe } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { HistoricalDatePipe } from '@myrmidon/cadmus-refs-historical-date';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { PhysicalSizePipe } from '@myrmidon/cadmus-mat-physical-size';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  CodBinding,
  CodBindingsPart,
  COD_BINDINGS_PART_TYPEID,
} from '../cod-bindings-part';
import { CodBindingEditorComponent } from '../cod-binding-editor/cod-binding-editor.component';

interface CodBindingsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

interface CodBindingsPartControls {
  bindings: CodBinding[];
}

function toDraft(part?: CodBindingsPart | null): CodBindingsPartControls {
  // copy: the form tags the objects in its arrays
  return { bindings: copyFormValue(part?.bindings || []) };
}

/**
 * CodBindingsPart editor component.
 * Thesauri: cod-binding-tags, cod-binding-cover-materials, cod-binding-board-materials;
 * chronotope-tags, assertion-tags, doc-reference-types, doc-reference-tags;
 * physical-size-tags, physical-size-dim-tags, physical-size-units (all optional).
 */
@Component({
  selector: 'cadmus-cod-bindings-part',
  templateUrl: './cod-bindings-part.component.html',
  styleUrls: ['./cod-bindings-part.component.css'],
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
    CodBindingEditorComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
    TitleCasePipe,
    FlatLookupPipe,
    HistoricalDatePipe,
    PhysicalSizePipe,
    HelpLinkComponent
  ],
})
export class CodBindingsPartComponent extends ModelEditorComponentBase<CodBindingsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly editedBinding = signal<CodBinding | undefined>(undefined);

  // cod-binding-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-binding-tags']?.entries,
  );
  // cod-binding-cover-materials
  public readonly coverEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-binding-cover-materials']?.entries,
  );
  // cod-binding-board-materials
  public readonly boardEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-binding-board-materials']?.entries,
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
  // physical-size-tags
  public readonly szTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-tags']?.entries,
  );
  // physical-size-dim-tags
  public readonly szDimTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-dim-tags']?.entries,
  );
  // physical-size-units
  public readonly szUnitEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-units']?.entries,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.bindings, 1);
  });

  constructor() {
    super();
    this.initSettings<CodBindingsPartSettings>(
      COD_BINDINGS_PART_TYPEID,
      (settings) =>
        this.lookupProviderOptions.set(
          settings?.lookupProviderOptions || undefined,
        ),
    );
  }

  protected getValue(): CodBindingsPart {
    const part = this.getEditedPart(COD_BINDINGS_PART_TYPEID) as CodBindingsPart;
    part.bindings = copyFormValue(this._draft().bindings);
    return part;
  }

  private setBindings(bindings: CodBinding[]): void {
    this.form.bindings().value.set(bindings);
    this.form.bindings().markAsDirty();
  }

  public addBinding(): void {
    this.editBinding({
      coverMaterial: this.coverEntries()?.length
        ? this.coverEntries()![0].id
        : '',
      boardMaterial: this.boardEntries()?.length
        ? this.boardEntries()![0].id
        : '',
      chronotope: {},
    });
  }

  public editBinding(binding: CodBinding | null, index = -1): void {
    if (!binding) {
      this.editedIndex.set(-1);
      this.editedBinding.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedBinding.set(structuredClone(binding));
    }
  }

  public onBindingChange(binding: CodBinding): void {
    const bindings = [...this.form.bindings().value()];
    if (this.editedIndex() > -1) {
      bindings.splice(this.editedIndex(), 1, binding);
    } else {
      bindings.push(binding);
    }
    this.setBindings(bindings);
    this.editBinding(null);
  }

  public deleteBinding(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete binding?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.form.bindings().value()];
          entries.splice(index, 1);
          this.setBindings(entries);
        }
      });
  }

  public moveBindingUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entries = [...this.form.bindings().value()];
    const entry = entries[index];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.setBindings(entries);
  }

  public moveBindingDown(index: number): void {
    if (index + 1 >= this.form.bindings().value().length) {
      return;
    }
    const entries = [...this.form.bindings().value()];
    const entry = entries[index];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.setBindings(entries);
  }
}

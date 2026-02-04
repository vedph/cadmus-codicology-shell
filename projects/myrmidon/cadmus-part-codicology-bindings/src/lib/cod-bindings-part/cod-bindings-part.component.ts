import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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

import {
  NgxToolsValidators,
  FlatLookupPipe,
  deepCopy,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { HistoricalDatePipe } from '@myrmidon/cadmus-refs-historical-date';

import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
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
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  ],
})
export class CodBindingsPartComponent
  extends ModelEditorComponentBase<CodBindingsPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly editedBinding = signal<CodBinding | undefined>(undefined);

  // cod-binding-tags
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-binding-cover-materials
  public coverEntries: ThesaurusEntry[] | undefined;
  // cod-binding-board-materials
  public boardEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-tags
  public szTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-dim-tags
  public szDimTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-units
  public szUnitEntries: ThesaurusEntry[] | undefined;

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  public bindings: FormControl<CodBinding[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
    super(authService, formBuilder);
    this.editedIndex.set(-1);
    // form
    this.bindings = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.bindings,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-binding-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries = thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-binding-cover-materials';
    if (this.hasThesaurus(key)) {
      this.coverEntries = thesauri[key].entries;
    } else {
      this.coverEntries = undefined;
    }
    key = 'cod-binding-board-materials';
    if (this.hasThesaurus(key)) {
      this.boardEntries = thesauri[key].entries;
    } else {
      this.boardEntries = undefined;
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
    key = 'physical-size-tags';
    if (this.hasThesaurus(key)) {
      this.szTagEntries = thesauri[key].entries;
    } else {
      this.szTagEntries = undefined;
    }
    key = 'physical-size-dim-tags';
    if (this.hasThesaurus(key)) {
      this.szDimTagEntries = thesauri[key].entries;
    } else {
      this.szDimTagEntries = undefined;
    }
    key = 'physical-size-units';
    if (this.hasThesaurus(key)) {
      this.szUnitEntries = thesauri[key].entries;
    } else {
      this.szUnitEntries = undefined;
    }
  }

  private updateForm(part?: CodBindingsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.bindings.setValue(part.bindings || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodBindingsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }
    this._appRepository
      ?.getSettingFor<CodBindingsPartSettings>(
        COD_BINDINGS_PART_TYPEID,
        this.identity()?.roleId || undefined,
      )
      .then((settings) => {
        const options = settings?.lookupProviderOptions;
        this.lookupProviderOptions.set(options || undefined);
      });

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodBindingsPart {
    let part = this.getEditedPart(COD_BINDINGS_PART_TYPEID) as CodBindingsPart;
    part.bindings = this.bindings.value || [];
    return part;
  }

  public addBinding(): void {
    this.editBinding({
      coverMaterial: this.coverEntries?.length ? this.coverEntries[0].id : '',
      boardMaterial: this.boardEntries?.length ? this.boardEntries[0].id : '',
      chronotope: {},
    });
  }

  public editBinding(binding: CodBinding | null, index = -1): void {
    if (!binding) {
      this.editedIndex.set(-1);
      this.editedBinding.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedBinding.set(deepCopy(binding));
    }
  }

  public onBindingChange(binding: CodBinding): void {
    const bindings = [...this.bindings.value];
    if (this.editedIndex() > -1) {
      bindings.splice(this.editedIndex(), 1, binding);
    } else {
      bindings.push(binding);
    }
    this.bindings.setValue(bindings);
    this.bindings.updateValueAndValidity();
    this.bindings.markAsDirty();
    this.editBinding(null);
  }

  public deleteBinding(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete binding?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.bindings.value];
          entries.splice(index, 1);
          this.bindings.setValue(entries);
          this.bindings.updateValueAndValidity();
          this.bindings.markAsDirty();
        }
      });
  }

  public moveBindingUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.bindings.value[index];
    const entries = [...this.bindings.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.bindings.setValue(entries);
    this.bindings.updateValueAndValidity();
    this.bindings.markAsDirty();
  }

  public moveBindingDown(index: number): void {
    if (index + 1 >= this.bindings.value.length) {
      return;
    }
    const entry = this.bindings.value[index];
    const entries = [...this.bindings.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.bindings.setValue(entries);
    this.bindings.updateValueAndValidity();
    this.bindings.markAsDirty();
  }
}

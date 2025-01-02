import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { take } from 'rxjs/operators';

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
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { NgxToolsValidators, FlatLookupPipe } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { HistoricalDatePipe } from '@myrmidon/cadmus-refs-historical-date';

import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  EditedObject,
  ModelEditorComponentBase,
  CadmusUiModule,
} from '@myrmidon/cadmus-ui';

import {
  CodBinding,
  CodBindingsPart,
  COD_BINDINGS_PART_TYPEID,
} from '../cod-bindings-part';
import { CodBindingEditorComponent } from '../cod-binding-editor/cod-binding-editor.component';

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
    MatTabGroup,
    MatTab,
    MatButton,
    MatIconButton,
    MatTooltip,
    CodBindingEditorComponent,
    MatCardActions,
    CadmusUiModule,
    FlatLookupPipe,
    HistoricalDatePipe,
  ],
})
export class CodBindingsPartComponent
  extends ModelEditorComponentBase<CodBindingsPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedBinding: CodBinding | undefined;

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

  public entries: FormControl<CodBinding[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.entries = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.entries,
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
    this.entries.setValue(part.bindings || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodBindingsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodBindingsPart {
    let part = this.getEditedPart(COD_BINDINGS_PART_TYPEID) as CodBindingsPart;
    part.bindings = this.entries.value || [];
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
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedBinding = undefined;
    } else {
      this._editedIndex = index;
      this.editedBinding = binding;
      setTimeout(() => {
        this.tabIndex = 1;
      });
    }
  }

  public onBindingSave(binding: CodBinding): void {
    const bindings = [...this.entries.value];
    if (this._editedIndex > -1) {
      bindings.splice(this._editedIndex, 1, binding);
    } else {
      bindings.push(binding);
    }

    this.entries.setValue(bindings);
    this.editBinding(null);
  }

  public deleteBinding(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete binding?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.entries.value];
          entries.splice(index, 1);
          this.entries.setValue(entries);
        }
      });
  }

  public moveBindingUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.entries.value[index];
    const entries = [...this.entries.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.entries.setValue(entries);
  }

  public moveBindingDown(index: number): void {
    if (index + 1 >= this.entries.value.length) {
      return;
    }
    const entry = this.entries.value[index];
    const entries = [...this.entries.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.entries.setValue(entries);
  }
}

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
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltip } from '@angular/material/tooltip';

import {
  NgxToolsValidators,
  EllipsisPipe,
  FlatLookupPipe,
  deepCopy,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import {
  CodEdit,
  CodEditsPart,
  COD_EDITS_PART_TYPEID,
} from '../cod-edits-part';
import { CodEditEditorComponent } from '../cod-edit-editor/cod-edit-editor.component';

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
    CodEditEditorComponent,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    EllipsisPipe,
    FlatLookupPipe,
    CodLocationRangePipe,
  ],
})
export class CodEditsPartComponent
  extends ModelEditorComponentBase<CodEditsPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly editedEdit = signal<CodEdit | undefined>(undefined);

  // cod-edit-colors
  public colorEntries: ThesaurusEntry[] | undefined;
  // cod-edit-techniques
  public techEntries: ThesaurusEntry[] | undefined;
  // cod-edit-types
  public typeEntries: ThesaurusEntry[] | undefined;
  // cod-edit-tags
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-edit-positions
  public posEntries: ThesaurusEntry[] | undefined;
  // cod-edit-languages
  public langEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // external-id-tags
  public idTagEntries: ThesaurusEntry[] | undefined;
  // external-id-scopes
  public idScopeEntries: ThesaurusEntry[] | undefined;

  public edits: FormControl<CodEdit[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.edits = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      edits: this.edits,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-edit-colors';
    if (this.hasThesaurus(key)) {
      this.colorEntries = thesauri[key].entries;
    } else {
      this.colorEntries = undefined;
    }
    key = 'cod-edit-techniques';
    if (this.hasThesaurus(key)) {
      this.techEntries = thesauri[key].entries;
    } else {
      this.techEntries = undefined;
    }
    key = 'cod-edit-types';
    if (this.hasThesaurus(key)) {
      this.typeEntries = thesauri[key].entries;
    } else {
      this.typeEntries = undefined;
    }
    key = 'cod-edit-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries = thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-edit-positions';
    if (this.hasThesaurus(key)) {
      this.posEntries = thesauri[key].entries;
    } else {
      this.posEntries = undefined;
    }
    key = 'cod-edit-languages';
    if (this.hasThesaurus(key)) {
      this.langEntries = thesauri[key].entries;
    } else {
      this.langEntries = undefined;
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
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries = thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
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
  }

  private updateForm(part?: CodEditsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.edits.setValue(part.edits || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodEditsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodEditsPart {
    let part = this.getEditedPart(COD_EDITS_PART_TYPEID) as CodEditsPart;
    part.edits = this.edits.value || [];
    return part;
  }

  public addEdit(): void {
    this.editEdit({
      type: this.typeEntries?.length ? this.typeEntries[0].id : '',
      ranges: [],
    });
  }

  public editEdit(edit: CodEdit | null, index = -1): void {
    if (!edit) {
      this.editedIndex.set(-1);
      this.editedEdit.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedEdit.set(deepCopy(edit));
    }
  }

  public onEditChange(edit: CodEdit): void {
    const edits = [...this.edits.value];

    if (this.editedIndex() > -1) {
      edits.splice(this.editedIndex(), 1, edit);
    } else {
      edits.push(edit);
    }

    this.edits.setValue(edits);
    this.editEdit(null);
  }

  public deleteEdit(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete edit?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.edits.value];
          entries.splice(index, 1);
          this.edits.setValue(entries);
        }
      });
  }

  public moveEditUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.edits.value[index];
    const entries = [...this.edits.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.edits.setValue(entries);
  }

  public moveEditDown(index: number): void {
    if (index + 1 >= this.edits.value.length) {
      return;
    }
    const entry = this.edits.value[index];
    const entries = [...this.edits.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.edits.setValue(entries);
  }
}

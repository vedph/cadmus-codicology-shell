import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';
import { take } from 'rxjs/operators';

import { NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodEdit,
  CodEditsPart,
  COD_EDITS_PART_TYPEID,
} from '../cod-edits-part';

/**
 * CodEditsPart editor component.
 * Thesauri: cod-edit-colors, cod-edit-techniques, cod-edit-types,
 * cod-edit-tags, cod-edit-languages, doc-reference-types,
 * doc-reference-tags.
 */
@Component({
  selector: 'cadmus-cod-edits-part',
  templateUrl: './cod-edits-part.component.html',
  styleUrls: ['./cod-edits-part.component.css'],
})
export class CodEditsPartComponent
  extends ModelEditorComponentBase<CodEditsPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedEdit: CodEdit | undefined;

  // cod-edit-colors
  public colorEntries: ThesaurusEntry[] | undefined;
  // cod-edit-techniques
  public techEntries: ThesaurusEntry[] | undefined;
  // cod-edit-types
  public typeEntries: ThesaurusEntry[] | undefined;
  // cod-edit-tags
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-edit-languages
  public langEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;

  public edits: FormControl<CodEdit[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.edits = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
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
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedEdit = undefined;
    } else {
      this._editedIndex = index;
      this.editedEdit = edit;
      setTimeout(() => {
        this.tabIndex = 1;
      });
    }
  }

  public onEditSave(edit: CodEdit): void {
    const edits = [...this.edits.value];

    if (this._editedIndex > -1) {
      edits.splice(this._editedIndex, 1, edit);
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

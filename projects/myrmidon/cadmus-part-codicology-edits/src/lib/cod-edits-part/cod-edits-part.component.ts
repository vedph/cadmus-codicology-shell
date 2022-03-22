import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

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

  public edits: FormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.edits = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      edits: this.edits,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodEditsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.edits.setValue(model.edits || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodEditsPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'cod-edit-colors';
    if (this.thesauri && this.thesauri[key]) {
      this.colorEntries = this.thesauri[key].entries;
    } else {
      this.colorEntries = undefined;
    }
    key = 'cod-edit-techniques';
    if (this.thesauri && this.thesauri[key]) {
      this.techEntries = this.thesauri[key].entries;
    } else {
      this.techEntries = undefined;
    }
    key = 'cod-edit-types';
    if (this.thesauri && this.thesauri[key]) {
      this.typeEntries = this.thesauri[key].entries;
    } else {
      this.typeEntries = undefined;
    }
    key = 'cod-edit-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.tagEntries = this.thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-edit-languages';
    if (this.thesauri && this.thesauri[key]) {
      this.langEntries = this.thesauri[key].entries;
    } else {
      this.langEntries = undefined;
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

  protected getModelFromForm(): CodEditsPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_EDITS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        edits: [],
      };
    }
    part.edits = this.edits.value || [];
    return part;
  }

  public addEdit(): void {
    const edit: CodEdit = {
      type: this.typeEntries?.length ? this.typeEntries[0].id : '',
      ranges: [],
    };
    this.edits.setValue([...this.edits.value, edit]);
    this.editEdit(this.edits.value.length - 1);
  }

  public editEdit(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedEdit = undefined;
    } else {
      this._editedIndex = index;
      this.editedEdit = this.edits.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onEditSave(entry: CodEdit): void {
    this.edits.setValue(
      this.edits.value.map((e: CodEdit, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.editEdit(-1);
  }

  public onEditClose(): void {
    this.editEdit(-1);
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

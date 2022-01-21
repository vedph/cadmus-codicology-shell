import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CodBinding,
  CodBindingsPart,
  COD_BINDINGS_PART_TYPEID,
} from '../cod-bindings-part';

/**
 * CodBindingsPart editor component.
 * Thesauri: cod-binding-tags, cod-binding-cover-materials, cod-binding-board-materials;
 * assertion-tags, doc-reference-types, doc-reference-tags;
 * physical-size-tags, physical-size-dim-tags, physical-size-units (all optional).
 */
@Component({
  selector: 'cadmus-cod-bindings-part',
  templateUrl: './cod-bindings-part.component.html',
  styleUrls: ['./cod-bindings-part.component.css'],
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

  public entries: FormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.entries = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      entries: this.entries,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodBindingsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.entries.setValue(model.bindings || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodBindingsPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'cod-binding-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.tagEntries = this.thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-binding-cover-materials';
    if (this.thesauri && this.thesauri[key]) {
      this.coverEntries = this.thesauri[key].entries;
    } else {
      this.coverEntries = undefined;
    }
    key = 'cod-binding-board-materials';
    if (this.thesauri && this.thesauri[key]) {
      this.boardEntries = this.thesauri[key].entries;
    } else {
      this.boardEntries = undefined;
    }
    key = 'assertion-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.assTagEntries = this.thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
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
    key = 'physical-size-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.szTagEntries = this.thesauri[key].entries;
    } else {
      this.szTagEntries = undefined;
    }
    key = 'physical-size-dim-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.szDimTagEntries = this.thesauri[key].entries;
    } else {
      this.szDimTagEntries = undefined;
    }
    key = 'physical-size-units';
    if (this.thesauri && this.thesauri[key]) {
      this.szUnitEntries = this.thesauri[key].entries;
    } else {
      this.szUnitEntries = undefined;
    }
  }

  protected getModelFromForm(): CodBindingsPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_BINDINGS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        bindings: [],
      };
    }
    part.bindings = this.entries.value || [];
    return part;
  }

  public addBinding(): void {
    const binding: CodBinding = {
      coverMaterial: this.coverEntries?.length ? this.coverEntries[0].id : '',
      boardMaterial: this.boardEntries?.length ? this.boardEntries[0].id : '',
      chronotope: {},
    };
    this.entries.setValue([...this.entries.value, binding]);
    this.editBinding(this.entries.value.length - 1);
  }

  public editBinding(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedBinding = undefined;
    } else {
      this._editedIndex = index;
      this.editedBinding = this.entries.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onBindingSave(entry: CodBinding): void {
    this.entries.setValue(
      this.entries.value.map((e: CodBinding, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.editBinding(-1);
  }

  public onBindingClose(): void {
    this.editBinding(-1);
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

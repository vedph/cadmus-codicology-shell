import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodShelfmark,
  CodShelfmarksPart,
  COD_SHELFMARKS_PART_TYPEID,
} from '../cod-shelfmarks-part';

/**
 * CodShelfmarksPart editor component.
 * Thesauri: cod-shelfmark-tags, cod-shelfmark-libraries (all optional).
 */
@Component({
  selector: 'cadmus-cod-shelfmarks-part',
  templateUrl: './cod-shelfmarks-part.component.html',
  styleUrls: ['./cod-shelfmarks-part.component.css'],
})
export class CodShelfmarksPartComponent
  extends ModelEditorComponentBase<CodShelfmarksPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedShelfmark: CodShelfmark | undefined;

  // cod-shelfmark-tags
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-shelfmark-libraries
  public libEntries: ThesaurusEntry[] | undefined;

  public shelfmarks: UntypedFormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: UntypedFormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.shelfmarks = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      entries: this.shelfmarks,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodShelfmarksPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.shelfmarks.setValue(model.shelfmarks || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodShelfmarksPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'cod-shelfmark-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.tagEntries = this.thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-shelfmark-libraries';
    if (this.thesauri && this.thesauri[key]) {
      this.libEntries = this.thesauri[key].entries;
    } else {
      this.libEntries = undefined;
    }
  }

  protected getModelFromForm(): CodShelfmarksPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_SHELFMARKS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        shelfmarks: [],
      };
    }
    part.shelfmarks = this.shelfmarks.value || [];
    return part;
  }

  public addShelfmark(): void {
    const entry: CodShelfmark = {
      city: '',
      library: this.libEntries?.length ? this.libEntries[0].id : '',
      location: '',
    };
    this.shelfmarks.setValue([...this.shelfmarks.value, entry]);
    this.editShelfmark(this.shelfmarks.value.length - 1);
  }

  public editShelfmark(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedShelfmark = undefined;
    } else {
      this._editedIndex = index;
      this.editedShelfmark = this.shelfmarks.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onShelfmarkSave(entry: CodShelfmark): void {
    this.shelfmarks.setValue(
      this.shelfmarks.value.map((e: CodShelfmark, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.editShelfmark(-1);
  }

  public onShelfmarkClose(): void {
    this.editShelfmark(-1);
  }

  public deleteShelfmark(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete shelfmark?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.shelfmarks.value];
          entries.splice(index, 1);
          this.shelfmarks.setValue(entries);
        }
      });
  }

  public moveShelfmarkUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.shelfmarks.value[index];
    const entries = [...this.shelfmarks.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.shelfmarks.setValue(entries);
  }

  public moveShelfmarkDown(index: number): void {
    if (index + 1 >= this.shelfmarks.value.length) {
      return;
    }
    const entry = this.shelfmarks.value[index];
    const entries = [...this.shelfmarks.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.shelfmarks.setValue(entries);
  }
}

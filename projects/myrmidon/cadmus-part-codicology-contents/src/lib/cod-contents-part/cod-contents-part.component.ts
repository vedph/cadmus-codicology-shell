import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodContent,
  CodContentsPart,
  COD_CONTENTS_PART_TYPEID,
} from '../cod-contents-part';

/**
 * CodContentsPart editor component.
 * Thesauri: cod-content-states, cod-content-tags, cod-content-annotation-types
 * (all optional).
 */
@Component({
  selector: 'cadmus-cod-contents-part',
  templateUrl: './cod-contents-part.component.html',
  styleUrls: ['./cod-contents-part.component.css'],
})
export class CodContentsPartComponent
  extends ModelEditorComponentBase<CodContentsPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedContent: CodContent | undefined;

  // cod-content-states
  public stateEntries: ThesaurusEntry[] | undefined;
  // cod-content-tags
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-content-annotation-types
  public annTypeEntries: ThesaurusEntry[] | undefined;

  public contents: FormControl<CodContent[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.contents = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.form = formBuilder.group({
      entries: this.contents,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodContentsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.contents.setValue(model.contents || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodContentsPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'cod-content-states';
    if (this.thesauri && this.thesauri[key]) {
      this.stateEntries = this.thesauri[key].entries;
    } else {
      this.stateEntries = undefined;
    }
    key = 'cod-content-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.tagEntries = this.thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-content-annotation-types';
    if (this.thesauri && this.thesauri[key]) {
      this.annTypeEntries = this.thesauri[key].entries;
    } else {
      this.annTypeEntries = undefined;
    }
  }

  protected getModelFromForm(): CodContentsPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_CONTENTS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        contents: [],
      };
    }
    part.contents = this.contents.value || [];
    return part;
  }

  public addContent(): void {
    const content: CodContent = {
      ranges: [],
      states: [],
      title: '',
    };
    this.contents.setValue([...this.contents.value, content]);
    this.editContent(this.contents.value.length - 1);
  }

  public editContent(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedContent = undefined;
    } else {
      this._editedIndex = index;
      this.editedContent = this.contents.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onContentSave(entry: CodContent): void {
    this.contents.setValue(
      this.contents.value.map((e: CodContent, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.editContent(-1);
  }

  public onContentClose(): void {
    this.editContent(-1);
  }

  public deleteContent(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete content?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const contents = [...this.contents.value];
          contents.splice(index, 1);
          this.contents.setValue(contents);
        }
      });
  }

  public moveContentUp(index: number): void {
    if (index < 1) {
      return;
    }
    const content = this.contents.value[index];
    const contents = [...this.contents.value];
    contents.splice(index, 1);
    contents.splice(index - 1, 0, content);
    this.contents.setValue(contents);
  }

  public moveContentDown(index: number): void {
    if (index + 1 >= this.contents.value.length) {
      return;
    }
    const content = this.contents.value[index];
    const contents = [...this.contents.value];
    contents.splice(index, 1);
    contents.splice(index + 1, 0, content);
    this.contents.setValue(contents);
  }
}

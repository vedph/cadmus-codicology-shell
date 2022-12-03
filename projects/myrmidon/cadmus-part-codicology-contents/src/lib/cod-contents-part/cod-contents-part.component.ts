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
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.contents = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      contents: this.contents,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-content-states';
    if (this.hasThesaurus(key)) {
      this.stateEntries = thesauri[key].entries;
    } else {
      this.stateEntries = undefined;
    }
    key = 'cod-content-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries = thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-content-annotation-types';
    if (this.hasThesaurus(key)) {
      this.annTypeEntries = thesauri[key].entries;
    } else {
      this.annTypeEntries = undefined;
    }
  }

  private updateForm(part?: CodContentsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.contents.setValue(part.contents || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodContentsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodContentsPart {
    let part = this.getEditedPart(COD_CONTENTS_PART_TYPEID) as CodContentsPart;
    part.contents = this.contents.value || [];
    return part;
  }

  public addContent(): void {
    this.editContent({
      ranges: [],
      states: [],
      title: '',
    });
  }

  public editContent(content: CodContent | null, index = -1): void {
    if (!content) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedContent = undefined;
    } else {
      this._editedIndex = index;
      this.editedContent = content;
      setTimeout(() => {
        this.tabIndex = 1;
      });
    }
  }

  public onContentSave(content: CodContent): void {
    const contents = [...this.contents.value];

    if (this._editedIndex > -1) {
      contents.splice(this._editedIndex, 1, content);
    } else {
      contents.push(content);
    }

    this.contents.setValue(contents);
    this.editContent(null);
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

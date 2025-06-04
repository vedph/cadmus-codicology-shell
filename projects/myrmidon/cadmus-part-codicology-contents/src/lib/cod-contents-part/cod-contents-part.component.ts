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
import { TitleCasePipe } from '@angular/common';

// material
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

// myrmidon
import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';

// bricks
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

// cadmus
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  EditedObject,
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

// local
import {
  CodContent,
  CodContentsPart,
  COD_CONTENTS_PART_TYPEID,
} from '../cod-contents-part';
import { CodContentEditorComponent } from '../cod-content-editor/cod-content-editor.component';

/**
 * CodContentsPart editor component.
 * Thesauri: cod-content-states, cod-content-tags, cod-content-annotation-features,
 * cod-content-annotation-languages, cod-content-annotation-types,
 * assertion-tags, doc-reference-types, doc-reference-tags, external-id-tags,
 * external-id-scopes (all optional).
 */
@Component({
  selector: 'cadmus-cod-contents-part',
  templateUrl: './cod-contents-part.component.html',
  styleUrls: ['./cod-contents-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TitleCasePipe,
    // material
    MatButton,
    MatCard,
    MatCardActions,
    MatCardAvatar,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatExpansionModule,
    MatIcon,
    MatIconButton,
    MatTooltip,
    // bricks
    CodLocationRangePipe,
    // cadmus
    CodContentEditorComponent,
    CloseSaveButtonsComponent,
  ],
})
export class CodContentsPartComponent
  extends ModelEditorComponentBase<CodContentsPart>
  implements OnInit
{
  public editedIndex: number;
  public editedContent?: CodContent;

  // cod-content-states
  public stateEntries?: ThesaurusEntry[];
  // cod-content-tags
  public tagEntries?: ThesaurusEntry[];
  // cod-content-annotation-types
  public annTypeEntries?: ThesaurusEntry[];
  // cod-content-annotation-features
  public annFeatureEntries?: ThesaurusEntry[];
  // cod-content-annotation-languages
  public annLangEntries?: ThesaurusEntry[];
  // assertion-tags
  public assTagEntries?: ThesaurusEntry[];
  // doc-reference-types
  public refTypeEntries?: ThesaurusEntry[];
  // doc-reference-tags
  public refTagEntries?: ThesaurusEntry[];
  // external-id-tags
  public idTagEntries?: ThesaurusEntry[];
  // external-id-scopes
  public idScopeEntries?: ThesaurusEntry[];

  public contents: FormControl<CodContent[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this.editedIndex = -1;
    // form
    this.contents = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
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
    key = 'cod-content-annotation-features';
    if (this.hasThesaurus(key)) {
      this.annFeatureEntries = thesauri[key].entries;
    } else {
      this.annFeatureEntries = undefined;
    }
    key = 'cod-content-annotation-languages';
    if (this.hasThesaurus(key)) {
      this.annLangEntries = thesauri[key].entries;
    } else {
      this.annLangEntries = undefined;
    }
    key = 'cod-content-annotation-types';
    if (this.hasThesaurus(key)) {
      this.annTypeEntries = thesauri[key].entries;
    } else {
      this.annTypeEntries = undefined;
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
      this.editedIndex = -1;
      this.editedContent = undefined;
    } else {
      this.editedIndex = index;
      this.editedContent = content;
    }
  }

  public onContentSave(content: CodContent): void {
    const contents = [...this.contents.value];

    if (this.editedIndex > -1) {
      contents.splice(this.editedIndex, 1, content);
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

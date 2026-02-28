import {
  ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
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
import { deepCopy, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';

// bricks
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

// cadmus
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

// local
import {
  CodContent,
  CodContentsPart,
  COD_CONTENTS_PART_TYPEID,
} from '../cod-contents-part';
import { CodContentEditorComponent } from '../cod-content-editor/cod-content-editor.component';

interface CodContentsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

/**
 * CodContentsPart editor component.
 * Thesauri: cod-content-states, cod-content-tags, cod-content-annotation-features,
 * cod-content-annotation-languages, cod-content-annotation-types,
 * cod-content-gap-types, cod-content-gap-tags,
 * assertion-tags, doc-reference-types, doc-reference-tags, external-id-tags,
 * external-id-scopes (all optional).
 */
@Component({
  selector: 'cadmus-cod-contents-part',
  templateUrl: './cod-contents-part.component.html',
  styleUrls: ['./cod-contents-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  public readonly editedIndex = signal<number>(-1);
  public readonly editedContent = signal<CodContent | undefined>(undefined);

  // cod-content-states
  public readonly stateEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-content-tags
  public readonly tagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-content-annotation-types
  public readonly annTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-content-annotation-features
  public readonly annFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-content-annotation-languages
  public readonly annLangEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-content-gap-types
  public readonly gapTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-content-gap-tags
  public readonly gapTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // doc-reference-types
  public readonly refTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // doc-reference-tags
  public readonly refTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // external-id-tags
  public readonly idTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // external-id-scopes
  public readonly idScopeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  public contents: FormControl<CodContent[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
    super(authService, formBuilder);
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
      this.stateEntries.set(thesauri[key].entries);
    } else {
      this.stateEntries.set(undefined);
    }
    key = 'cod-content-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries.set(thesauri[key].entries);
    } else {
      this.tagEntries.set(undefined);
    }
    key = 'cod-content-annotation-features';
    if (this.hasThesaurus(key)) {
      this.annFeatureEntries.set(thesauri[key].entries);
    } else {
      this.annFeatureEntries.set(undefined);
    }
    key = 'cod-content-annotation-languages';
    if (this.hasThesaurus(key)) {
      this.annLangEntries.set(thesauri[key].entries);
    } else {
      this.annLangEntries.set(undefined);
    }
    key = 'cod-content-annotation-types';
    if (this.hasThesaurus(key)) {
      this.annTypeEntries.set(thesauri[key].entries);
    } else {
      this.annTypeEntries.set(undefined);
    }
    key = 'cod-content-gap-types';
    if (this.hasThesaurus(key)) {
      this.gapTypeEntries.set(thesauri[key].entries);
    } else {
      this.gapTypeEntries.set(undefined);
    }
    key = 'cod-content-gap-tags';
    if (this.hasThesaurus(key)) {
      this.gapTagEntries.set(thesauri[key].entries);
    } else {
      this.gapTagEntries.set(undefined);
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.refTypeEntries.set(thesauri[key].entries);
    } else {
      this.refTypeEntries.set(undefined);
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries.set(thesauri[key].entries);
    } else {
      this.refTagEntries.set(undefined);
    }
    key = 'external-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries.set(thesauri[key].entries);
    } else {
      this.idTagEntries.set(undefined);
    }
    key = 'external-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries.set(thesauri[key].entries);
    } else {
      this.idScopeEntries.set(undefined);
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
    // settings
    this._appRepository
      ?.getSettingFor<CodContentsPartSettings>(
        COD_CONTENTS_PART_TYPEID,
        this.identity()?.roleId || undefined,
      )
      .then((settings) => {
        const options = settings?.lookupProviderOptions;
        this.lookupProviderOptions.set(options || undefined);
      });

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
      this.editedIndex.set(-1);
      this.editedContent.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedContent.set(deepCopy(content));
    }
  }

  public onContentSave(content: CodContent): void {
    const contents = [...this.contents.value];

    if (this.editedIndex() > -1) {
      contents.splice(this.editedIndex(), 1, content);
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

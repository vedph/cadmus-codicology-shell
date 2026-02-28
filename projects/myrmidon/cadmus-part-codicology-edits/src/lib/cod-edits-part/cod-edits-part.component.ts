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
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  CodEdit,
  CodEditsPart,
  COD_EDITS_PART_TYPEID,
} from '../cod-edits-part';
import { CodEditEditorComponent } from '../cod-edit-editor/cod-edit-editor.component';

interface CodEditsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  public readonly colorEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-edit-techniques
  public readonly techEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-edit-types
  public readonly typeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-edit-tags
  public readonly tagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-edit-positions
  public readonly posEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-edit-languages
  public readonly langEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // doc-reference-types
  public readonly refTypeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // doc-reference-tags
  public readonly refTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // external-id-tags
  public readonly idTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // external-id-scopes
  public readonly idScopeEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  public edits: FormControl<CodEdit[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
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
      this.colorEntries.set(thesauri[key].entries);
    } else {
      this.colorEntries.set(undefined);
    }
    key = 'cod-edit-techniques';
    if (this.hasThesaurus(key)) {
      this.techEntries.set(thesauri[key].entries);
    } else {
      this.techEntries.set(undefined);
    }
    key = 'cod-edit-types';
    if (this.hasThesaurus(key)) {
      this.typeEntries.set(thesauri[key].entries);
    } else {
      this.typeEntries.set(undefined);
    }
    key = 'cod-edit-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries.set(thesauri[key].entries);
    } else {
      this.tagEntries.set(undefined);
    }
    key = 'cod-edit-positions';
    if (this.hasThesaurus(key)) {
      this.posEntries.set(thesauri[key].entries);
    } else {
      this.posEntries.set(undefined);
    }
    key = 'cod-edit-languages';
    if (this.hasThesaurus(key)) {
      this.langEntries.set(thesauri[key].entries);
    } else {
      this.langEntries.set(undefined);
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
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
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
    // settings
    this._appRepository
      ?.getSettingFor<CodEditsPartSettings>(
        COD_EDITS_PART_TYPEID,
        this.identity()?.roleId || undefined,
      )
      .then((settings) => {
        const options = settings?.lookupProviderOptions;
        this.lookupProviderOptions.set(options || undefined);
      });
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
      type: this.typeEntries()?.length ? this.typeEntries()![0].id : '',
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

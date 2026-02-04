import { Component, input, OnInit, signal } from '@angular/core';
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
import { MatTooltip } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { deepCopy, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

import {
  CodDecoration,
  CodDecorationsPart,
  COD_DECORATIONS_PART_TYPEID,
} from '../cod-decorations-part';
import { CodDecorationComponent } from '../cod-decoration/cod-decoration.component';

/**
 * CodDecorationsPart editor component.
 * Thesauri: cod-decoration-flags, cod-decoration-element-flags,
 * cod-decoration-element-types,
 * cod-decoration-type-hidden, cod-decoration-element-colors,
 * cod-decoration-element-gildings, cod-decoration-element-techniques,
 * cod-decoration-element-positions, cod-decoration-element-tools,
 * cod-decoration-element-tags,
 * cod-decoration-element-typologies, cod-image-types,
 * cod-decoration-artist-types, cod-decoration-artist-style-names,
 * chronotope-tags, assertion-tags, doc-reference-types, doc-reference-tags,
 * external-id-tags, external-id-scopes, pin-link-settings.
 */
@Component({
  selector: 'cadmus-cod-decorations-part',
  templateUrl: './cod-decorations-part.component.html',
  styleUrls: ['./cod-decorations-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatExpansionModule,
    MatIconButton,
    MatTooltip,
    CodDecorationComponent,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
  ],
})
export class CodDecorationsPartComponent
  extends ModelEditorComponentBase<CodDecorationsPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly editedDecoration = signal<CodDecoration | undefined>(
    undefined,
  );

  // cod-decoration-flags
  public readonly decFlagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-element-flags
  public readonly decElemFlagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-element-types (required)
  public readonly decElemTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-type-hidden
  public readonly decTypeHiddenEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-element-colors
  public readonly decElemColorEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-element-gildings
  public readonly decElemGildingEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-element-techniques
  public readonly decElemTechEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-element-positions
  public readonly decElemPosEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-element-tags
  public readonly decElemTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-element-tools
  public readonly decElemToolEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-element-typologies
  public readonly decElemTypolEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-image-types
  public readonly imgTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-artist-types
  public readonly artTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-decoration-artist-style-names
  public readonly artStyleEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // chronotope-tags
  public readonly ctTagEntries = signal<ThesaurusEntry[] | undefined>(
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

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public decorations: FormControl<CodDecoration[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
    super(authService, formBuilder);
    // form
    this.decorations = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      decorations: this.decorations,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-decoration-flags';
    if (this.hasThesaurus(key)) {
      this.decFlagEntries.set(thesauri[key].entries);
    } else {
      this.decFlagEntries.set(undefined);
    }

    key = 'cod-decoration-element-flags';
    if (this.hasThesaurus(key)) {
      this.decElemFlagEntries.set(thesauri[key].entries);
    } else {
      this.decElemFlagEntries.set(undefined);
    }

    key = 'cod-decoration-element-types';
    if (this.hasThesaurus(key)) {
      this.decElemTypeEntries.set(thesauri[key].entries);
    } else {
      this.decElemTypeEntries.set(undefined);
    }

    key = 'cod-decoration-type-hidden';
    if (this.hasThesaurus(key)) {
      this.decTypeHiddenEntries.set(thesauri[key].entries);
    } else {
      this.decTypeHiddenEntries.set(undefined);
    }

    key = 'cod-decoration-element-colors';
    if (this.hasThesaurus(key)) {
      this.decElemColorEntries.set(thesauri[key].entries);
    } else {
      this.decElemColorEntries.set(undefined);
    }

    key = 'cod-decoration-element-gildings';
    if (this.hasThesaurus(key)) {
      this.decElemGildingEntries.set(thesauri[key].entries);
    } else {
      this.decElemGildingEntries.set(undefined);
    }

    key = 'cod-decoration-element-techniques';
    if (this.hasThesaurus(key)) {
      this.decElemTechEntries.set(thesauri[key].entries);
    } else {
      this.decElemTechEntries.set(undefined);
    }

    key = 'cod-decoration-element-tags';
    if (this.hasThesaurus(key)) {
      this.decElemTagEntries.set(thesauri[key].entries);
    } else {
      this.decElemTagEntries.set(undefined);
    }

    key = 'cod-decoration-element-positions';
    if (this.hasThesaurus(key)) {
      this.decElemPosEntries.set(thesauri[key].entries);
    } else {
      this.decElemPosEntries.set(undefined);
    }

    key = 'cod-decoration-element-tools';
    if (this.hasThesaurus(key)) {
      this.decElemToolEntries.set(thesauri[key].entries);
    } else {
      this.decElemToolEntries.set(undefined);
    }

    key = 'cod-decoration-element-typologies';
    if (this.hasThesaurus(key)) {
      this.decElemTypolEntries.set(thesauri[key].entries);
    } else {
      this.decElemTypolEntries.set(undefined);
    }

    key = 'cod-image-types';
    if (this.hasThesaurus(key)) {
      this.imgTypeEntries.set(thesauri[key].entries);
    } else {
      this.imgTypeEntries.set(undefined);
    }

    key = 'cod-decoration-artist-types';
    if (this.hasThesaurus(key)) {
      this.artTypeEntries.set(thesauri[key].entries);
    } else {
      this.artTypeEntries.set(undefined);
    }

    key = 'cod-decoration-artist-style-names';
    if (this.hasThesaurus(key)) {
      this.artStyleEntries.set(thesauri[key].entries);
    } else {
      this.artStyleEntries.set(undefined);
    }

    key = 'chronotope-tags';
    if (this.hasThesaurus(key)) {
      this.ctTagEntries.set(thesauri[key].entries);
    } else {
      this.ctTagEntries.set(undefined);
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

  private updateForm(part?: CodDecorationsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.decorations.setValue(part.decorations || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodDecorationsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodDecorationsPart {
    let part = this.getEditedPart(
      COD_DECORATIONS_PART_TYPEID,
    ) as CodDecorationsPart;
    part.decorations = this.decorations.value || [];
    return part;
  }

  public addDecoration(): void {
    this.editDecoration({
      name: '',
    });
  }

  public editDecoration(decoration: CodDecoration | null, index = -1): void {
    if (!decoration) {
      this.editedIndex.set(-1);
      this.editedDecoration.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedDecoration.set(deepCopy(decoration));
    }
  }

  public onDecorationSave(decoration: CodDecoration): void {
    const decorations = [...(this.decorations.value || [])];

    if (this.editedIndex() > -1) {
      decorations.splice(this.editedIndex(), 1, decoration);
    } else {
      decorations.push(decoration);
    }

    this.decorations.setValue(decorations);
    this.decorations.markAsDirty();
    this.decorations.updateValueAndValidity();
    this.editDecoration(null);
  }

  public deleteDecoration(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete entry?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...(this.decorations.value || [])];
          entries.splice(index, 1);
          this.decorations.setValue(entries);
          this.decorations.updateValueAndValidity();
          this.decorations.markAsDirty();
        }
      });
  }

  public moveDecorationUp(index: number): void {
    if (index < 1) {
      return;
    }
    const decorationsArray = this.decorations.value || [];
    if (index >= decorationsArray.length) return;

    const entry = decorationsArray[index];
    const entries = [...decorationsArray];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.decorations.setValue(entries);
    this.decorations.updateValueAndValidity();
    this.decorations.markAsDirty();
  }

  public moveDecorationDown(index: number): void {
    const decorationsArray = this.decorations.value || [];
    if (index + 1 >= decorationsArray.length) {
      return;
    }
    const entry = decorationsArray[index];
    const entries = [...decorationsArray];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.decorations.setValue(entries);
    this.decorations.updateValueAndValidity();
    this.decorations.markAsDirty();
  }
}

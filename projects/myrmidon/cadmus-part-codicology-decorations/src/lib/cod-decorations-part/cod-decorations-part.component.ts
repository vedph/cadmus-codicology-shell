import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';
import { take } from 'rxjs/operators';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodDecoration,
  CodDecorationsPart,
  COD_DECORATIONS_PART_TYPEID,
} from '../cod-decorations-part';

/**
 * CodDecorationsPart editor component.
 * Thesauri: cod-decoration-flags, cod-decoration-element-flags,
 * cod-decoration-element-types,
 * cod-decoration-type-hidden, cod-decoration-element-colors,
 * cod-decoration-element-gildings, cod-decoration-element-techniques,
 * cod-decoration-element-positions, cod-decoration-element-tools,
 * cod-decoration-element-typologies, cod-image-types,
 * cod-decoration-artist-types, cod-decoration-artist-style-names,
 * chronotope-tags, assertion-tags, doc-reference-types, doc-reference-tags,
 * external-id-tags, external-id-scopes, pin-link-settings.
 */
@Component({
  selector: 'cadmus-cod-decorations-part',
  templateUrl: './cod-decorations-part.component.html',
  styleUrls: ['./cod-decorations-part.component.css'],
  standalone: false,
})
export class CodDecorationsPartComponent
  extends ModelEditorComponentBase<CodDecorationsPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedDecoration: CodDecoration | undefined;

  // cod-decoration-flags
  public decFlagEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-flags
  public decElemFlagEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-types (required)
  public decElemTypeEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-type-hidden
  public decTypeHiddenEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-colors
  public decElemColorEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-gildings
  public decElemGildingEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-techniques
  public decElemTechEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-positions
  public decElemPosEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-tools
  public decElemToolEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-element-typologies
  public decElemTypolEntries: ThesaurusEntry[] | undefined;
  // cod-image-types
  public imgTypeEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-artist-types
  public artTypeEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-artist-style-names
  public artStyleEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;
  // external-id-tags
  public idTagEntries: ThesaurusEntry[] | undefined;
  // external-id-scopes
  public idScopeEntries: ThesaurusEntry[] | undefined;

  // pin links settings
  // by-type: true/false
  public pinByTypeMode?: boolean;
  // switch-mode: true/false
  public canSwitchMode?: boolean;
  // edit-target: true/false
  public canEditTarget?: boolean;

  public decorations: FormControl<CodDecoration[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
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

  /**
   * Load settings from thesaurus entries.
   *
   * @param entries The thesaurus entries if any.
   */
  private loadSettings(entries?: ThesaurusEntry[]): void {
    if (!entries?.length) {
      this.pinByTypeMode = undefined;
      this.canSwitchMode = undefined;
      this.canEditTarget = undefined;
    }
    this.pinByTypeMode =
      entries?.find((e) => e.id === 'by-type')?.value === 'true';
    this.canSwitchMode =
      entries?.find((e) => e.id === 'switch-mode')?.value === 'true';
    this.canEditTarget =
      entries?.find((e) => e.id === 'edit-target')?.value === 'true';
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-decoration-flags';
    if (this.hasThesaurus(key)) {
      this.decFlagEntries = thesauri[key].entries;
    } else {
      this.decFlagEntries = undefined;
    }

    key = 'cod-decoration-element-flags';
    if (this.hasThesaurus(key)) {
      this.decElemFlagEntries = thesauri[key].entries;
    } else {
      this.decElemFlagEntries = undefined;
    }

    key = 'cod-decoration-element-types';
    if (this.hasThesaurus(key)) {
      this.decElemTypeEntries = thesauri[key].entries;
    } else {
      this.decElemTypeEntries = undefined;
    }

    key = 'cod-decoration-type-hidden';
    if (this.hasThesaurus(key)) {
      this.decTypeHiddenEntries = thesauri[key].entries;
    } else {
      this.decTypeHiddenEntries = undefined;
    }

    key = 'cod-decoration-element-colors';
    if (this.hasThesaurus(key)) {
      this.decElemColorEntries = thesauri[key].entries;
    } else {
      this.decElemColorEntries = undefined;
    }

    key = 'cod-decoration-element-gildings';
    if (this.hasThesaurus(key)) {
      this.decElemGildingEntries = thesauri[key].entries;
    } else {
      this.decElemGildingEntries = undefined;
    }

    key = 'cod-decoration-element-techniques';
    if (this.hasThesaurus(key)) {
      this.decElemTechEntries = thesauri[key].entries;
    } else {
      this.decElemTechEntries = undefined;
    }

    key = 'cod-decoration-element-positions';
    if (this.hasThesaurus(key)) {
      this.decElemPosEntries = thesauri[key].entries;
    } else {
      this.decElemPosEntries = undefined;
    }

    key = 'cod-decoration-element-tools';
    if (this.hasThesaurus(key)) {
      this.decElemToolEntries = thesauri[key].entries;
    } else {
      this.decElemToolEntries = undefined;
    }

    key = 'cod-decoration-element-typologies';
    if (this.hasThesaurus(key)) {
      this.decElemTypolEntries = thesauri[key].entries;
    } else {
      this.decElemTypolEntries = undefined;
    }

    key = 'cod-image-types';
    if (this.hasThesaurus(key)) {
      this.imgTypeEntries = thesauri[key].entries;
    } else {
      this.imgTypeEntries = undefined;
    }

    key = 'cod-decoration-artist-types';
    if (this.hasThesaurus(key)) {
      this.artTypeEntries = thesauri[key].entries;
    } else {
      this.artTypeEntries = undefined;
    }

    key = 'cod-decoration-artist-style-names';
    if (this.hasThesaurus(key)) {
      this.artStyleEntries = thesauri[key].entries;
    } else {
      this.artStyleEntries = undefined;
    }

    key = 'chronotope-tags';
    if (this.hasThesaurus(key)) {
      this.ctTagEntries = thesauri[key].entries;
    } else {
      this.ctTagEntries = undefined;
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

    this.loadSettings(thesauri['pin-link-settings']?.entries);
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
      COD_DECORATIONS_PART_TYPEID
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
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedDecoration = undefined;
    } else {
      this._editedIndex = index;
      this.editedDecoration = decoration;
      setTimeout(() => {
        this.tabIndex = 1;
      });
    }
  }

  public onDecorationSave(decoration: CodDecoration): void {
    const decorations = [...this.decorations.value];

    if (this._editedIndex > -1) {
      decorations.splice(this._editedIndex, 1, decoration);
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
          const entries = [...this.decorations.value];
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
    const entry = this.decorations.value[index];
    const entries = [...this.decorations.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.decorations.setValue(entries);
    this.decorations.updateValueAndValidity();
    this.decorations.markAsDirty();
  }

  public moveDecorationDown(index: number): void {
    if (index + 1 >= this.decorations.value.length) {
      return;
    }
    const entry = this.decorations.value[index];
    const entries = [...this.decorations.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.decorations.setValue(entries);
    this.decorations.updateValueAndValidity();
    this.decorations.markAsDirty();
  }
}

import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodDecoration,
  CodDecorationsPart,
  COD_DECORATIONS_PART_TYPEID,
} from '../cod-decorations-part';

/**
 * CodDecorationsPart editor component.
 * Thesauri: cod-decoration-element-flags, cod-decoration-element-types,
 * cod-decoration-type-hidden, cod-decoration-element-colors,
 * cod-decoration-element-gildings, cod-decoration-element-techniques,
 * cod-decoration-element-positions, cod-decoration-element-tools,
 * cod-decoration-element-typologies, cod-image-types,
 * cod-decoration-artist-types, cod-decoration-artist-style-names,
 * chronotope-tags, assertion-tags, doc-reference-types, doc-reference-tags.
 */
@Component({
  selector: 'cadmus-cod-decorations-part',
  templateUrl: './cod-decorations-part.component.html',
  styleUrls: ['./cod-decorations-part.component.css'],
})
export class CodDecorationsPartComponent
  extends ModelEditorComponentBase<CodDecorationsPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedDecoration: CodDecoration | undefined;

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

  public decorations: FormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.decorations = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      decorations: this.decorations,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodDecorationsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.decorations.setValue(model.decorations || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodDecorationsPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'cod-decoration-element-flags';
    if (this.thesauri && this.thesauri[key]) {
      this.decElemFlagEntries = this.thesauri[key].entries;
    } else {
      this.decElemFlagEntries = undefined;
    }

    key = 'cod-decoration-element-types';
    if (this.thesauri && this.thesauri[key]) {
      this.decElemTypeEntries = this.thesauri[key].entries;
    } else {
      this.decElemTypeEntries = undefined;
    }

    key = 'cod-decoration-type-hidden';
    if (this.thesauri && this.thesauri[key]) {
      this.decTypeHiddenEntries = this.thesauri[key].entries;
    } else {
      this.decTypeHiddenEntries = undefined;
    }

    key = 'cod-decoration-element-colors';
    if (this.thesauri && this.thesauri[key]) {
      this.decElemColorEntries = this.thesauri[key].entries;
    } else {
      this.decElemColorEntries = undefined;
    }

    key = 'cod-decoration-element-gildings';
    if (this.thesauri && this.thesauri[key]) {
      this.decElemGildingEntries = this.thesauri[key].entries;
    } else {
      this.decElemGildingEntries = undefined;
    }

    key = 'cod-decoration-element-techniques';
    if (this.thesauri && this.thesauri[key]) {
      this.decElemTechEntries = this.thesauri[key].entries;
    } else {
      this.decElemTechEntries = undefined;
    }

    key = 'cod-decoration-element-positions';
    if (this.thesauri && this.thesauri[key]) {
      this.decElemPosEntries = this.thesauri[key].entries;
    } else {
      this.decElemPosEntries = undefined;
    }

    key = 'cod-decoration-element-tools';
    if (this.thesauri && this.thesauri[key]) {
      this.decElemToolEntries = this.thesauri[key].entries;
    } else {
      this.decElemToolEntries = undefined;
    }

    key = 'cod-decoration-element-typologies';
    if (this.thesauri && this.thesauri[key]) {
      this.decElemTypolEntries = this.thesauri[key].entries;
    } else {
      this.decElemTypolEntries = undefined;
    }

    key = 'cod-image-types';
    if (this.thesauri && this.thesauri[key]) {
      this.imgTypeEntries = this.thesauri[key].entries;
    } else {
      this.imgTypeEntries = undefined;
    }

    key = 'cod-decoration-artist-types';
    if (this.thesauri && this.thesauri[key]) {
      this.artTypeEntries = this.thesauri[key].entries;
    } else {
      this.artTypeEntries = undefined;
    }

    key = 'cod-decoration-artist-style-names';
    if (this.thesauri && this.thesauri[key]) {
      this.artStyleEntries = this.thesauri[key].entries;
    } else {
      this.artStyleEntries = undefined;
    }

    key = 'chronotope-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.ctTagEntries = this.thesauri[key].entries;
    } else {
      this.ctTagEntries = undefined;
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
  }

  protected getModelFromForm(): CodDecorationsPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_DECORATIONS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        decorations: [],
      };
    }
    part.decorations = this.decorations.value || [];
    return part;
  }

  public addDecoration(): void {
    const decoration: CodDecoration = {
      name: '',
    };
    this.decorations.setValue([...this.decorations.value, decoration]);
    this.decorations.markAsDirty();
    this.editDecoration(this.decorations.value.length - 1);
  }

  public editDecoration(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedDecoration = undefined;
    } else {
      this._editedIndex = index;
      this.editedDecoration = this.decorations.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onDecorationSave(entry: CodDecoration): void {
    this.decorations.setValue(
      this.decorations.value.map((e: CodDecoration, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.editDecoration(-1);
    this.decorations.markAsDirty();
  }

  public onDecorationClose(): void {
    this.editDecoration(-1);
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
    this.decorations.markAsDirty();
  }
}

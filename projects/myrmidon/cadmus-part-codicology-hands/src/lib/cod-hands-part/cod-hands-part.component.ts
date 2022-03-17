import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CodHand,
  CodHandsPart,
  COD_HANDS_PART_TYPEID,
} from '../cod-hands-part';

/**
 * CodHandsPart editor component.
 * Thesauri: cod-hand-sign-types, cod-hand-scripts, cod-hand-typologies,
 * cod-hand-colors, chronotope-tags, assertion-tags, doc-reference-types,
 * doc-reference-tags, cod-image-types, cod-hand-subscription-languages
 * (all optional).
 */
@Component({
  selector: 'cadmus-cod-hands-part',
  templateUrl: './cod-hands-part.component.html',
  styleUrls: ['./cod-hands-part.component.css'],
})
export class CodHandsPartComponent
  extends ModelEditorComponentBase<CodHandsPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedHand: CodHand | undefined;

  // thesauri from description:
  // cod-hand-sign-types
  public sgnTypeEntries: ThesaurusEntry[] | undefined;
  // thesauri from instance:
  // cod-hand-scripts
  public scriptEntries: ThesaurusEntry[] | undefined;
  // cod-hand-typologies
  public typeEntries: ThesaurusEntry[] | undefined;
  // cod-hand-colors
  public colorEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;
  // cod-image-types
  public imgTypeEntries: ThesaurusEntry[] | undefined;
  // thesauri from subscription:
  // cod-hand-subscription-languages
  public subLangEntries: ThesaurusEntry[] | undefined;

  public hands: FormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.hands = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      entries: this.hands,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodHandsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.hands.setValue(model.hands || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodHandsPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'cod-hand-sign-types';
    if (this.thesauri && this.thesauri[key]) {
      this.sgnTypeEntries = this.thesauri[key].entries;
    } else {
      this.sgnTypeEntries = undefined;
    }
    key = 'cod-hand-scripts';
    if (this.thesauri && this.thesauri[key]) {
      this.scriptEntries = this.thesauri[key].entries;
    } else {
      this.scriptEntries = undefined;
    }
    key = 'cod-hand-typologies';
    if (this.thesauri && this.thesauri[key]) {
      this.typeEntries = this.thesauri[key].entries;
    } else {
      this.typeEntries = undefined;
    }
    key = 'cod-hand-colors';
    if (this.thesauri && this.thesauri[key]) {
      this.colorEntries = this.thesauri[key].entries;
    } else {
      this.colorEntries = undefined;
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
    key = 'cod-image-types';
    if (this.thesauri && this.thesauri[key]) {
      this.imgTypeEntries = this.thesauri[key].entries;
    } else {
      this.imgTypeEntries = undefined;
    }
    key = 'cod-hand-subscription-languages';
    if (this.thesauri && this.thesauri[key]) {
      this.subLangEntries = this.thesauri[key].entries;
    } else {
      this.subLangEntries = undefined;
    }
  }

  protected getModelFromForm(): CodHandsPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_HANDS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        hands: [],
      };
    }
    part.hands = this.hands.value || [];
    return part;
  }

  public addHand(): void {
    const hand: CodHand = {
      descriptions: [],
      instances: [],
    };
    this.hands.setValue([...this.hands.value, hand]);
    this.hands.updateValueAndValidity();
    this.hands.markAsDirty();
    this.editHand(this.hands.value.length - 1);
  }

  public editHand(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedHand = undefined;
    } else {
      this._editedIndex = index;
      this.editedHand = this.hands.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onHandSave(entry: CodHand): void {
    this.hands.setValue(
      this.hands.value.map((e: CodHand, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.hands.updateValueAndValidity();
    this.hands.markAsDirty();
    this.editHand(-1);
  }

  public onHandClose(): void {
    this.editHand(-1);
  }

  public deleteHand(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete hand?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.hands.value];
          entries.splice(index, 1);
          this.hands.setValue(entries);
          this.hands.updateValueAndValidity();
          this.hands.markAsDirty();
        }
      });
  }

  public moveHandUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.hands.value[index];
    const entries = [...this.hands.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.hands.setValue(entries);
    this.hands.updateValueAndValidity();
    this.hands.markAsDirty();
  }

  public moveHandDown(index: number): void {
    if (index + 1 >= this.hands.value.length) {
      return;
    }
    const entry = this.hands.value[index];
    const entries = [...this.hands.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.hands.setValue(entries);
    this.hands.updateValueAndValidity();
    this.hands.markAsDirty();
  }
}

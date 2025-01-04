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

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';

import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  EditedObject,
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

import {
  CodHand,
  CodHandsPart,
  COD_HANDS_PART_TYPEID,
} from '../cod-hands-part';
import { CodHandComponent } from '../cod-hand/cod-hand.component';

/**
 * CodHandsPart editor component.
 * Thesauri: cod-hand-sign-types, cod-hand-scripts, cod-hand-typologies,
 * cod-hand-colors, chronotope-tags, assertion-tags, doc-reference-types,
 * doc-reference-tags, cod-image-types, cod-hand-subscription-languages,
 * external-id-tags, external-id-scopes
 * (all optional except cod-hand-scripts).
 */
@Component({
  selector: 'cadmus-cod-hands-part',
  templateUrl: './cod-hands-part.component.html',
  styleUrls: ['./cod-hands-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatTabGroup,
    MatTab,
    MatButton,
    MatIconButton,
    MatTooltip,
    CodHandComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
  ],
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
  // external-id-tags
  public idTagEntries: ThesaurusEntry[] | undefined;
  // external-id-scopes
  public idScopeEntries: ThesaurusEntry[] | undefined;

  // thesauri from subscription:
  // cod-hand-subscription-languages
  public subLangEntries: ThesaurusEntry[] | undefined;

  public hands: FormControl<CodHand[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.hands = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      hands: this.hands,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-hand-sign-types';
    if (this.hasThesaurus(key)) {
      this.sgnTypeEntries = thesauri[key].entries;
    } else {
      this.sgnTypeEntries = undefined;
    }
    key = 'cod-hand-scripts';
    if (this.hasThesaurus(key)) {
      this.scriptEntries = thesauri[key].entries;
    } else {
      this.scriptEntries = undefined;
    }
    key = 'cod-hand-typologies';
    if (this.hasThesaurus(key)) {
      this.typeEntries = thesauri[key].entries;
    } else {
      this.typeEntries = undefined;
    }
    key = 'cod-hand-colors';
    if (this.hasThesaurus(key)) {
      this.colorEntries = thesauri[key].entries;
    } else {
      this.colorEntries = undefined;
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
    key = 'cod-image-types';
    if (this.hasThesaurus(key)) {
      this.imgTypeEntries = thesauri[key].entries;
    } else {
      this.imgTypeEntries = undefined;
    }
    key = 'cod-hand-subscription-languages';
    if (this.hasThesaurus(key)) {
      this.subLangEntries = thesauri[key].entries;
    } else {
      this.subLangEntries = undefined;
    }
    key = 'external-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries = thesauri[key].entries;
    }
    key = 'external-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries = thesauri[key].entries;
    }
  }

  private updateForm(part?: CodHandsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.hands.setValue(part.hands || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodHandsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodHandsPart {
    let part = this.getEditedPart(COD_HANDS_PART_TYPEID) as CodHandsPart;
    part.hands = this.hands.value || [];
    return part;
  }

  public addHand(): void {
    const hand: CodHand = {
      descriptions: [],
      instances: [],
    };
    this.editHand(hand);
  }

  public editHand(hand: CodHand | null, index = -1): void {
    this._editedIndex = index;
    this.editedHand = hand || undefined;
    setTimeout(() => {
      this.tabIndex = hand ? 1 : 0;
    });
  }

  public onHandSave(hand: CodHand): void {
    const hands = [...this.hands.value];
    if (this._editedIndex > -1) {
      hands.splice(this._editedIndex, 1, hand);
    } else {
      hands.push(hand);
    }
    this.hands.setValue(hands);
    this.hands.updateValueAndValidity();
    this.hands.markAsDirty();
    this.editHand(null);
  }

  public onHandClose(): void {
    this.editHand(null);
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

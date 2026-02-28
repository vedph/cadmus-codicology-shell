import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
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

import { deepCopy, NgxToolsValidators } from '@myrmidon/ngx-tools';
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
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  CodHand,
  CodHandsPart,
  COD_HANDS_PART_TYPEID,
} from '../cod-hands-part';
import { CodHandComponent } from '../cod-hand/cod-hand.component';

interface CodHandsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

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
    TitleCasePipe,
    CloseSaveButtonsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodHandsPartComponent
  extends ModelEditorComponentBase<CodHandsPart>
  implements OnInit
{
  public readonly tabIndex = signal<number>(0);
  public readonly editedIndex = signal<number>(-1);
  public readonly editedHand = signal<CodHand | undefined>(undefined);

  // thesauri from description:
  // cod-hand-sign-types
  public readonly sgnTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // thesauri from instance:
  // cod-hand-scripts
  public readonly scriptEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-hand-typologies
  public readonly typeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-hand-colors
  public readonly colorEntries = signal<ThesaurusEntry[] | undefined>(
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
  // cod-image-types
  public readonly imgTypeEntries = signal<ThesaurusEntry[] | undefined>(
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

  // thesauri from subscription:
  // cod-hand-subscription-languages
  public readonly subLangEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  public hands: FormControl<CodHand[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
    super(authService, formBuilder);
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
    this.sgnTypeEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'cod-hand-scripts';
    this.scriptEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'cod-hand-typologies';
    this.typeEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'cod-hand-colors';
    this.colorEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'chronotope-tags';
    this.ctTagEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'assertion-tags';
    this.assTagEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'doc-reference-types';
    this.refTypeEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'doc-reference-tags';
    this.refTagEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'cod-image-types';
    this.imgTypeEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'cod-hand-subscription-languages';
    this.subLangEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'external-id-tags';
    this.idTagEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
    key = 'external-id-scopes';
    this.idScopeEntries.set(
      this.hasThesaurus(key) ? thesauri[key].entries : undefined,
    );
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
    // settings
    this._appRepository
      ?.getSettingFor<CodHandsPartSettings>(
        COD_HANDS_PART_TYPEID,
        this.identity()?.roleId || undefined,
      )
      .then((settings) => {
        const options = settings?.lookupProviderOptions;
        this.lookupProviderOptions.set(options || undefined);
      });
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
    this.editedIndex.set(index);
    this.editedHand.set(hand ? deepCopy(hand) : undefined);
    this.tabIndex.set(hand ? 1 : 0);
  }

  public onHandChange(hand: CodHand): void {
    const hands = [...this.hands.value];
    if (this.editedIndex() > -1) {
      hands.splice(this.editedIndex(), 1, hand);
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

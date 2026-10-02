import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
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

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
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

interface CodHandsPartControls {
  hands: CodHand[];
}

function toDraft(part?: CodHandsPart | null): CodHandsPartControls {
  // copy: the form tags the objects in its arrays
  return { hands: copyFormValue(part?.hands || []) };
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
    HelpLinkComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodHandsPartComponent
  extends ModelEditorComponentBase<CodHandsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly tabIndex = signal<number>(0);
  public readonly editedIndex = signal<number>(-1);
  public readonly editedHand = signal<CodHand | undefined>(undefined);

  // thesauri from description:
  // cod-hand-sign-types
  public readonly sgnTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-hand-sign-types']?.entries,
  );
  // thesauri from instance:
  // cod-hand-scripts
  public readonly scriptEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-hand-scripts']?.entries,
  );
  // cod-hand-typologies
  public readonly typeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-hand-typologies']?.entries,
  );
  // cod-hand-colors
  public readonly colorEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-hand-colors']?.entries,
  );
  // chronotope-tags
  public readonly ctTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['chronotope-tags']?.entries,
  );
  // assertion-tags
  public readonly assTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['assertion-tags']?.entries,
  );
  // doc-reference-types
  public readonly refTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly refTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );
  // cod-image-types
  public readonly imgTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-image-types']?.entries,
  );
  // external-id-tags
  public readonly idTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-tags']?.entries,
  );
  // external-id-scopes
  public readonly idScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-scopes']?.entries,
  );

  // thesauri from subscription:
  // cod-hand-subscription-languages
  public readonly subLangEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-hand-subscription-languages']?.entries,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);


  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.hands, 1);
  });

  constructor() {
    super();
    this.initSettings<CodHandsPartSettings>(COD_HANDS_PART_TYPEID, (settings) =>
      this.lookupProviderOptions.set(settings?.lookupProviderOptions || undefined),
    );
  }

  protected getValue(): CodHandsPart {
    const part = this.getEditedPart(COD_HANDS_PART_TYPEID) as CodHandsPart;
    part.hands = copyFormValue(this._draft().hands);
    return part;
  }

  private setHands(hands: CodHand[]): void {
    this.form.hands().value.set(hands);
    this.form.hands().markAsDirty();
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
    this.editedHand.set(hand ? structuredClone(hand) : undefined);
    this.tabIndex.set(hand ? 1 : 0);
  }

  public onHandChange(hand: CodHand): void {
    const hands = [...this.form.hands().value()];
    if (this.editedIndex() > -1) {
      hands.splice(this.editedIndex(), 1, hand);
    } else {
      hands.push(hand);
    }
    this.setHands(hands);
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
          const entries = [...this.form.hands().value()];
          entries.splice(index, 1);
          this.setHands(entries);
        }
      });
  }

  public moveHandUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.form.hands().value()[index];
    const entries = [...this.form.hands().value()];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.setHands(entries);
  }

  public moveHandDown(index: number): void {
    if (index + 1 >= this.form.hands().value().length) {
      return;
    }
    const entry = this.form.hands().value()[index];
    const entries = [...this.form.hands().value()];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.setHands(entries);
  }
}

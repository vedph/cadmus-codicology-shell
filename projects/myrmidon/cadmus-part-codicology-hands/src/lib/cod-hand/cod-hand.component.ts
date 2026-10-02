import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { form, FormField, maxLength } from '@angular/forms/signals';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';

import { take } from 'rxjs';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import {
  LookupDocReferencesComponent,
  LookupProviderOptions,
} from '@myrmidon/cadmus-refs-lookup';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  NgxToolsSignalValidators,
  FlatLookupPipe,
} from '@myrmidon/ngx-tools';
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import {
  CodHand,
  CodHandDescription,
  CodHandInstance,
  CodHandSubscription,
} from '../cod-hands-part';
import { CodHandDescriptionComponent } from '../cod-hand-description/cod-hand-description.component';
import { CodHandInstanceComponent } from '../cod-hand-instance/cod-hand-instance.component';
import { CodHandSubscriptionComponent } from '../cod-hand-subscription/cod-hand-subscription.component';

interface CodHandControls {
  eid: string;
  name: string;
  ids: AssertedCompositeId[];
  descriptions: CodHandDescription[];
  instances: CodHandInstance[];
  subscriptions: CodHandSubscription[];
  references: DocReference[];
}

function toDraft(hand?: CodHand): CodHandControls {
  return {
    eid: hand?.eid || '',
    name: hand?.name || '',
    ids: copyFormValue(hand?.ids || []),
    descriptions: copyFormValue(hand?.descriptions || []),
    instances: copyFormValue(hand?.instances || []),
    subscriptions: copyFormValue(hand?.subscriptions || []),
    references: copyFormValue(hand?.references || []),
  };
}

@Component({
  selector: 'cadmus-cod-hand',
  templateUrl: './cod-hand.component.html',
  styleUrls: ['./cod-hand.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    AssertedCompositeIdsComponent,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatIcon,
    MatButton,
    MatIconButton,
    MatTooltip,
    CodHandDescriptionComponent,
    CodHandInstanceComponent,
    CodHandSubscriptionComponent,
    LookupDocReferencesComponent,
    FlatLookupPipe,
    CodLocationRangePipe,
  ],
})
export class CodHandComponent {
  private readonly _dialogService = inject(DialogService);

  public readonly hand = model<CodHand>();

  private readonly _draft = linkedSignal(() => toDraft(this.hand()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.eid, 100);
    maxLength(p.name, 50);
    NgxToolsSignalValidators.strictMinLength(p.instances, 1);
  });

  // thesauri from description:
  // cod-hand-sign-types
  public readonly sgnTypeEntries = input<ThesaurusEntry[]>();

  // thesauri from instance:
  // cod-hand-scripts
  public readonly scriptEntries = input<ThesaurusEntry[]>();
  // cod-hand-typologies
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // cod-hand-colors
  public readonly colorEntries = input<ThesaurusEntry[]>();
  // chronotope-tags
  public readonly ctTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // cod-image-types
  public readonly imgTypeEntries = input<ThesaurusEntry[]>();
  // external-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // external-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();

  // thesauri from subscription:
  // cod-hand-subscription-languages
  public readonly subLangEntries = input<ThesaurusEntry[]>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public readonly editorClose = output();

  public readonly editedDscIndex = signal<number>(-1);
  public readonly editedDsc = signal<CodHandDescription | undefined>(undefined);

  public readonly editedIstIndex = signal<number>(-1);
  public readonly editedIst = signal<CodHandInstance | undefined>(undefined);

  public readonly editedSubIndex = signal<number>(-1);
  public readonly editedSub = signal<CodHandSubscription | undefined>(
    undefined,
  );

  // the sorted keys of the descriptions
  public readonly dscKeys = computed<string[]>(() =>
    this.form
      .descriptions()
      .value()
      .filter((d) => d.key)
      .map((d) => d.key!)
      .sort(),
  );

  constructor() {
    // new hand: clear the interaction state
    effect(() => {
      this.hand();
      untracked(() => this.form().reset());
    });
  }

  private getHand(): CodHand {
    const draft = this._draft();
    return {
      eid: draft.eid.trim() || undefined,
      name: draft.name.trim() || undefined,
      ids: draft.ids.length ? copyFormValue(draft.ids) : undefined,
      descriptions: copyFormValue(draft.descriptions),
      instances: copyFormValue(draft.instances),
      subscriptions: draft.subscriptions.length ? copyFormValue(draft.subscriptions) : undefined,
      references: draft.references.length ? copyFormValue(draft.references) : undefined,
    };
  }

  public onIdsChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.ids, copyFormValue(ids || []));
  }

  //#region descriptions
  public addDescription(): void {
    this.editDescription({});
  }

  public editDescription(
    description: CodHandDescription | null,
    index = -1,
  ): void {
    if (!description) {
      this.editedDscIndex.set(-1);
      this.editedDsc.set(undefined);
    } else {
      this.editedDscIndex.set(index);
      this.editedDsc.set(structuredClone(description));
    }
  }

  public onDescriptionChange(dsc: CodHandDescription): void {
    const descriptions = [...this.form.descriptions().value()];
    if (this.editedDscIndex() > -1) {
      descriptions.splice(this.editedDscIndex(), 1, dsc);
    } else {
      descriptions.push(dsc);
    }

    this.form.descriptions().value.set(descriptions);
    this.form.descriptions().markAsDirty();
    this.editDescription(null);
  }

  public deleteDescription(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete description?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const descriptions = [...this.form.descriptions().value()];
          descriptions.splice(index, 1);
          this.form.descriptions().value.set(descriptions);
          this.form.descriptions().markAsDirty();
        }
      });
  }

  public moveDescriptionUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.form.descriptions().value()[index];
    const items = [...this.form.descriptions().value()];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.form.descriptions().value.set(items);
    this.form.descriptions().markAsDirty();
  }

  public moveDescriptionDown(index: number): void {
    if (index + 1 >= this.form.descriptions().value().length) {
      return;
    }
    const item = this.form.descriptions().value()[index];
    const items = [...this.form.descriptions().value()];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.form.descriptions().value.set(items);
    this.form.descriptions().markAsDirty();
  }
  //#endregion

  //#region instances
  public addInstance(): void {
    this.editInstance({
      scripts: [],
      typologies: [],
      ranges: [],
    });
  }

  public editInstance(instance: CodHandInstance | null, index = -1): void {
    if (!instance) {
      this.editedIstIndex.set(-1);
      this.editedIst.set(undefined);
    } else {
      this.editedIstIndex.set(index);
      this.editedIst.set(structuredClone(instance));
    }
  }

  public onInstanceChange(instance: CodHandInstance): void {
    const instances = [...this.form.instances().value()];
    if (this.editedIstIndex() > -1) {
      instances.splice(this.editedIstIndex(), 1, instance);
    } else {
      instances.push(instance);
    }
    this.form.instances().value.set(instances);
    this.form.instances().markAsDirty();
    this.editInstance(null);
  }

  public deleteInstance(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete instance?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const items = [...this.form.instances().value()];
          items.splice(index, 1);
          this.form.instances().value.set(items);
          this.form.instances().markAsDirty();
        }
      });
  }

  public moveInstanceUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.form.instances().value()[index];
    const items = [...this.form.instances().value()];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.form.instances().value.set(items);
    this.form.instances().markAsDirty();
  }

  public moveInstanceDown(index: number): void {
    if (index + 1 >= this.form.instances().value().length) {
      return;
    }
    const item = this.form.instances().value()[index];
    const items = [...this.form.instances().value()];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.form.instances().value.set(items);
    this.form.instances().markAsDirty();
  }
  //#endregion

  //#region subscriptions
  public addSubscription(): void {
    this.editSubscription({
      ranges: [],
      language: this.subLangEntries()?.length
        ? this.subLangEntries()![0].id
        : '',
    });
  }

  public editSubscription(
    subscription: CodHandSubscription | null,
    index = -1,
  ): void {
    if (!subscription) {
      this.editedSubIndex.set(-1);
      this.editedSub.set(undefined);
    } else {
      this.editedSubIndex.set(index);
      this.editedSub.set(structuredClone(subscription));
    }
  }

  public onSubscriptionChange(subscription: CodHandSubscription): void {
    const subscriptions = [...this.form.subscriptions().value()];
    if (this.editedSubIndex() > -1) {
      subscriptions.splice(this.editedSubIndex(), 1, subscription);
    } else {
      subscriptions.push(subscription);
    }
    this.form.subscriptions().value.set(subscriptions);
    this.form.subscriptions().markAsDirty();
    this.editSubscription(null);
  }

  public deleteSubscription(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete subscription?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const items = [...this.form.subscriptions().value()];
          items.splice(index, 1);
          this.form.subscriptions().value.set(items);
          this.form.subscriptions().markAsDirty();
        }
      });
  }

  public moveSubscriptionUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.form.subscriptions().value()[index];
    const items = [...this.form.subscriptions().value()];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.form.subscriptions().value.set(items);
    this.form.subscriptions().markAsDirty();
  }

  public moveSubscriptionDown(index: number): void {
    if (index + 1 >= this.form.subscriptions().value().length) {
      return;
    }
    const item = this.form.subscriptions().value()[index];
    const items = [...this.form.subscriptions().value()];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.form.subscriptions().value.set(items);
    this.form.subscriptions().markAsDirty();
  }
  //#endregion

  public onReferencesChange(references: DocReference[]): void {
    setFieldFromChild(this.form.references, copyFormValue(references || []));
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public onEnterKey(event: Event): void {
    if (
      !isImplicitSubmission(event) ||
      this.form().invalid() ||
      !this.form().dirty()
    ) {
      return;
    }
    event.preventDefault();
    this.save();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.hand.set(this.getHand());
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { NgToolsValidators } from '@myrmidon/ng-tools';

import { debounceTime, take } from 'rxjs';

import {
  CodHand,
  CodHandDescription,
  CodHandInstance,
  CodHandSubscription,
} from '../cod-hands-part';

@Component({
  selector: 'cadmus-cod-hand',
  templateUrl: './cod-hand.component.html',
  styleUrls: ['./cod-hand.component.css'],
})
export class CodHandComponent implements OnInit {
  private _hand: CodHand | undefined;

  @Input()
  public get hand(): CodHand | undefined {
    return this._hand;
  }
  public set hand(value: CodHand | undefined) {
    if (this._hand === value) {
      return;
    }
    this._hand = value;
    this.updateForm(value);
  }

  // thesauri from description:
  // cod-hand-sign-types
  @Input()
  public sgnTypeEntries: ThesaurusEntry[] | undefined;

  // thesauri from instance:
  // cod-hand-scripts
  @Input()
  public scriptEntries: ThesaurusEntry[] | undefined;
  // cod-hand-typologies
  @Input()
  public typeEntries: ThesaurusEntry[] | undefined;
  // cod-hand-colors
  @Input()
  public colorEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  @Input()
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  @Input()
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  @Input()
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  @Input()
  public refTagEntries: ThesaurusEntry[] | undefined;
  // cod-image-types
  @Input()
  public imgTypeEntries: ThesaurusEntry[] | undefined;

  // thesauri from subscription:
  // cod-hand-subscription-languages
  @Input()
  public subLangEntries: ThesaurusEntry[] | undefined;

  @Output()
  public handChange: EventEmitter<CodHand>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl<string | null>;
  public name: FormControl<string | null>;
  public descriptions: FormControl<CodHandDescription[]>;
  public instances: FormControl<CodHandInstance[]>;
  public subscriptions: FormControl<CodHandSubscription[]>;
  public references: FormControl<DocReference[]>;
  public form: FormGroup;

  public editedDscIndex: number;
  public editedDsc?: CodHandDescription;

  public editedIstIndex: number;
  public editedIst?: CodHandInstance;

  public editedSubIndex: number;
  public editedSub?: CodHandSubscription;

  public dscKeys: string[];

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    this.editedDscIndex = -1;
    this.editedIstIndex = -1;
    this.editedSubIndex = -1;
    this.handChange = new EventEmitter<CodHand>();
    this.editorClose = new EventEmitter<any>();
    this.dscKeys = [];
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.name = formBuilder.control(null, Validators.maxLength(50));
    this.descriptions = formBuilder.control([], { nonNullable: true });
    this.instances = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.subscriptions = formBuilder.control([], { nonNullable: true });
    this.references = formBuilder.control([], { nonNullable: true });
    this.form = formBuilder.group({
      eid: this.eid,
      name: this.name,
      descriptions: this.descriptions,
      instances: this.instances,
      subscriptions: this.subscriptions,
      references: this.references,
    });
  }

  private updateDscKeys(descriptions: CodHandDescription[]): void {
    const keys: string[] = descriptions.length
      ? descriptions.filter((d) => d.key).map((d) => d.key!)
      : [];
    keys.sort();
    this.dscKeys = keys;
  }

  ngOnInit(): void {
    // if (this._hand) {
    //   this.updateForm(this._hand);
    // }

    // whenever descriptions change, update their keys list
    this.descriptions.valueChanges
      .pipe(debounceTime(200))
      .subscribe((value) => {
        this.updateDscKeys(value);
      });
  }

  private updateForm(hand: CodHand | undefined): void {
    if (!hand) {
      this.form.reset();
      this.dscKeys = [];
      return;
    }

    this.eid.setValue(hand.eid || null);
    this.name.setValue(hand.name || null);
    this.descriptions.setValue(hand.descriptions || []);
    this.instances.setValue(hand.instances || []);
    this.subscriptions.setValue(hand.subscriptions || []);
    this.references.setValue(hand.references || []);
    this.updateDscKeys(this.descriptions.value);
    this.form.markAsPristine();
  }

  private getHand(): CodHand {
    return {
      eid: this.eid.value?.trim(),
      name: this.name.value?.trim(),
      descriptions: this.descriptions.value,
      instances: this.instances.value || [],
      subscriptions: this.subscriptions.value?.length
        ? this.subscriptions.value
        : undefined,
      references: this.references.value?.length
        ? this.references.value
        : undefined,
    };
  }

  //#region descriptions
  public addDescription(): void {
    this.editDescription({});
  }

  public editDescription(
    description: CodHandDescription | null,
    index = -1
  ): void {
    if (!description) {
      this.editedDscIndex = -1;
      this.editedDsc = undefined;
    } else {
      this.editedDscIndex = index;
      this.editedDsc = description;
    }
  }

  public onDescriptionSave(dsc: CodHandDescription): void {
    const descriptions = [...this.descriptions.value];
    if (this.editedDscIndex > -1) {
      descriptions.splice(this.editedDscIndex, 1, dsc);
    } else {
      descriptions.push(dsc);
    }

    this.descriptions.setValue(descriptions);
    this.descriptions.updateValueAndValidity();
    this.descriptions.markAsDirty();
    this.editDescription(null);
  }

  public deleteDescription(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete description?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const descriptions = [...this.descriptions.value];
          descriptions.splice(index, 1);
          this.descriptions.setValue(descriptions);
          this.descriptions.updateValueAndValidity();
          this.descriptions.markAsDirty();
        }
      });
  }

  public moveDescriptionUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.descriptions.value[index];
    const items = [...this.descriptions.value];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.descriptions.setValue(items);
    this.descriptions.updateValueAndValidity();
    this.descriptions.markAsDirty();
  }

  public moveDescriptionDown(index: number): void {
    if (index + 1 >= this.descriptions.value.length) {
      return;
    }
    const item = this.descriptions.value[index];
    const items = [...this.descriptions.value];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.descriptions.setValue(items);
    this.descriptions.updateValueAndValidity();
    this.descriptions.markAsDirty();
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
      this.editedIstIndex = -1;
      this.editedIst = undefined;
    } else {
      this.editedIstIndex = index;
      this.editedIst = instance;
    }
  }

  public onInstanceSave(instance: CodHandInstance): void {
    const instances = [...this.instances.value];
    if (this.editedIstIndex > -1) {
      instances.splice(this.editedIstIndex, 1, instance);
    } else {
      instances.push(instance);
    }
    this.instances.setValue(instances);
    this.instances.updateValueAndValidity();
    this.instances.markAsDirty();
    this.editInstance(null);
  }

  public deleteInstance(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete instance?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const items = [...this.instances.value];
          items.splice(index, 1);
          this.instances.setValue(items);
          this.instances.updateValueAndValidity();
          this.instances.markAsDirty();
        }
      });
  }

  public moveInstanceUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.instances.value[index];
    const items = [...this.instances.value];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.instances.setValue(items);
    this.instances.updateValueAndValidity();
    this.instances.markAsDirty();
  }

  public moveInstanceDown(index: number): void {
    if (index + 1 >= this.instances.value.length) {
      return;
    }
    const item = this.instances.value[index];
    const items = [...this.instances.value];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.instances.setValue(items);
    this.instances.updateValueAndValidity();
    this.instances.markAsDirty();
  }
  //#endregion

  //#region subscriptions
  public addSubscription(): void {
    this.editSubscription({
      ranges: [],
      language: this.subLangEntries?.length ? this.subLangEntries[0].id : '',
    });
  }

  public editSubscription(
    subscription: CodHandSubscription | null,
    index = -1
  ): void {
    if (!subscription) {
      this.editedSubIndex = -1;
      this.editedSub = undefined;
    } else {
      this.editedSubIndex = index;
      this.editedSub = subscription;
    }
  }

  public onSubscriptionSave(subscription: CodHandSubscription): void {
    const subscriptions = [...this.subscriptions.value];
    if (this.editedSubIndex > -1) {
      subscriptions.splice(this.editedSubIndex, 1, subscription);
    } else {
      subscriptions.push(subscription);
    }
    this.subscriptions.setValue(subscriptions);
    this.subscriptions.updateValueAndValidity();
    this.subscriptions.markAsDirty();
    this.editSubscription(null);
  }

  public deleteSubscription(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete subscription?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const items = [...this.subscriptions.value];
          items.splice(index, 1);
          this.subscriptions.setValue(items);
          this.subscriptions.updateValueAndValidity();
          this.subscriptions.markAsDirty();
        }
      });
  }

  public moveSubscriptionUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.subscriptions.value[index];
    const items = [...this.subscriptions.value];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.subscriptions.setValue(items);
    this.subscriptions.updateValueAndValidity();
    this.subscriptions.markAsDirty();
  }

  public moveSubscriptionDown(index: number): void {
    if (index + 1 >= this.subscriptions.value.length) {
      return;
    }
    const item = this.subscriptions.value[index];
    const items = [...this.subscriptions.value];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.subscriptions.setValue(items);
    this.subscriptions.updateValueAndValidity();
    this.subscriptions.markAsDirty();
  }
  //#endregion

  public onReferencesChange(references: DocReference[]): void {
    this.references.setValue(references);
    this.references.updateValueAndValidity();
    this.references.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._hand = this.getHand();
    this.handChange.emit(this._hand);
  }
}

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
import { take } from 'rxjs';

import { CodHand } from '../../public-api';
import {
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

  public eid: FormControl;
  public name: FormControl;
  public descriptions: FormControl;
  public instances: FormControl;
  public subscriptions: FormControl;
  public references: FormControl;
  public form: FormGroup;

  public editedDscIndex: number;
  public editedDsc?: CodHandDescription;

  public editedIstIndex: number;
  public editedIst?: CodHandInstance;

  public editedSubIndex: number;
  public editedSub?: CodHandSubscription;

  public initialReferences: DocReference[];

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    this.editedDscIndex = -1;
    this.editedIstIndex = -1;
    this.editedSubIndex = -1;
    this.handChange = new EventEmitter<CodHand>();
    this.editorClose = new EventEmitter<any>();
    this.initialReferences = [];
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.name = formBuilder.control(null, Validators.maxLength(50));
    this.descriptions = formBuilder.control([]);
    this.instances = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.subscriptions = formBuilder.control([]);
    this.references = formBuilder.control([]);
    this.form = formBuilder.group({
      eid: this.eid,
      name: this.name,
      descriptions: this.descriptions,
      instances: this.instances,
      subscriptions: this.subscriptions,
      references: this.references,
    });
  }

  ngOnInit(): void {
    if (this._hand) {
      this.updateForm(this._hand);
    }
  }

  private updateForm(hand: CodHand | undefined): void {
    if (!hand) {
      this.form.reset();
      return;
    }

    this.eid.setValue(hand.eid);
    this.name.setValue(hand.name);
    this.descriptions.setValue(hand.descriptions || []);
    this.instances.setValue(hand.instances || []);
    this.subscriptions.setValue(hand.subscriptions || []);
    this.initialReferences = hand.references || [];
    this.form.markAsPristine();
  }

  private getHand(): CodHand {
    return {
      eid: this.eid.value?.trim(),
      name: this.name.value?.trim(),
      descriptions: this.descriptions.value?.length
        ? this.descriptions.value
        : undefined,
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
    const dsc: CodHandDescription = {};
    this.descriptions.setValue([...this.descriptions.value, dsc]);
    this.descriptions.markAsDirty();
    this.editDescription(this.descriptions.value.length - 1);
  }

  public editDescription(index: number): void {
    if (index < 0) {
      this.editedDscIndex = -1;
      this.editedDsc = undefined;
    } else {
      this.editedDscIndex = index;
      this.editedDsc = this.descriptions.value[index];
    }
  }

  public onDescriptionSave(item: CodHandDescription): void {
    this.descriptions.setValue(
      this.descriptions.value.map((x: CodHandDescription, i: number) =>
        i === this.editedDscIndex ? item : x
      )
    );
    this.descriptions.markAsDirty();
    this.editDescription(-1);
  }

  public onDescriptionClose(): void {
    this.editDescription(-1);
  }

  public deleteDescription(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete description?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const items = [...this.descriptions.value];
          items.splice(index, 1);
          this.descriptions.setValue(items);
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
    this.descriptions.markAsDirty();
  }
  //#endregion

  //#region instances
  public addInstance(): void {
    const item: CodHandInstance = {
      script: this.scriptEntries?.length ? this.scriptEntries[0].id : '',
      typologies: [],
      ranges: [],
    };
    this.instances.setValue([...this.instances.value, item]);
    this.instances.markAsDirty();
    this.editInstance(this.instances.value.length - 1);
  }

  public editInstance(index: number): void {
    if (index < 0) {
      this.editedIstIndex = -1;
      this.editedIst = undefined;
    } else {
      this.editedIstIndex = index;
      this.editedIst = this.instances.value[index];
    }
  }

  public onInstanceSave(item: CodHandInstance): void {
    this.instances.setValue(
      this.instances.value.map((x: CodHandInstance, i: number) =>
        i === this.editedIstIndex ? item : x
      )
    );
    this.instances.markAsDirty();
    this.editInstance(-1);
  }

  public onInstanceClose(): void {
    this.editInstance(-1);
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
    this.instances.markAsDirty();
  }
  //#endregion

  //#region subscriptions
  public addSubscription(): void {
    const sub: CodHandSubscription = {
      range: { start: { n: 0 }, end: { n: 0 } },
      language: this.subLangEntries?.length ? this.subLangEntries[0].id : '',
    };
    this.subscriptions.setValue([...this.subscriptions.value, sub]);
    this.subscriptions.markAsDirty();
    this.editSubscription(this.subscriptions.value.length - 1);
  }

  public editSubscription(index: number): void {
    if (index < 0) {
      this.editedSubIndex = -1;
      this.editedSub = undefined;
    } else {
      this.editedSubIndex = index;
      this.editedSub = this.subscriptions.value[index];
    }
  }

  public onSubscriptionSave(item: CodHandSubscription): void {
    this.subscriptions.setValue(
      this.subscriptions.value.map((x: CodHandSubscription, i: number) =>
        i === this.editedSubIndex ? item : x
      )
    );
    this.subscriptions.markAsDirty();
    this.editSubscription(-1);
  }

  public onSubscriptionClose(): void {
    this.editSubscription(-1);
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
    this.subscriptions.markAsDirty();
  }
  //#endregion

  public onReferencesChange(references: DocReference[]): void {
    this.references.setValue(references);
    this.references.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.handChange.emit(this.getHand());
  }
}

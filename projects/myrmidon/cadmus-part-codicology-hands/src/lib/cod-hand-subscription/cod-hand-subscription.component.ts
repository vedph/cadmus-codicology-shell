import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';

import { CodHandSubscription } from '../cod-hands-part';

@Component({
  selector: 'cadmus-cod-hand-subscription',
  templateUrl: './cod-hand-subscription.component.html',
  styleUrls: ['./cod-hand-subscription.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CodLocationComponent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodHandSubscriptionComponent implements OnInit {
  private _subscription: CodHandSubscription | undefined;

  @Input()
  public get subscription(): CodHandSubscription | undefined {
    return this._subscription;
  }
  public set subscription(value: CodHandSubscription | undefined) {
    if (this._subscription === value) {
      return;
    }
    this._subscription = value;
    this.updateForm(value);
  }

  // cod-hand-subscription-languages
  @Input()
  public langEntries: ThesaurusEntry[] | undefined;

  @Output()
  public subscriptionChange: EventEmitter<CodHandSubscription>;
  @Output()
  public editorClose: EventEmitter<any>;

  public ranges: FormControl<CodLocationRange[]>;
  public language: FormControl<string | null>;
  public text: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.subscriptionChange = new EventEmitter<CodHandSubscription>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.ranges = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.language = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.text = formBuilder.control(null, Validators.maxLength(1000));
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      ranges: this.ranges,
      language: this.language,
      text: this.text,
      note: this.note,
    });
  }

  ngOnInit(): void {
    if (this._subscription) {
      this.updateForm(this._subscription);
    }
  }

  private updateForm(subscription: CodHandSubscription | undefined): void {
    if (!subscription) {
      this.form.reset();
      return;
    }

    this.ranges.setValue(subscription.ranges || []);
    this.language.setValue(subscription.language);
    this.text.setValue(subscription.text || null);
    this.note.setValue(subscription.note || null);

    this.form.markAsPristine();
  }

  public onLocationChange(ranges: unknown): void {
    this.ranges.setValue((ranges as CodLocationRange[]) || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  private getSubscription(): CodHandSubscription {
    return {
      ranges: this.ranges.value || [],
      language: this.language.value?.trim() || '',
      text: this.text.value?.trim(),
      note: this.note.value?.trim(),
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._subscription = this.getSubscription();
    this.subscriptionChange.emit(this._subscription);
  }
}

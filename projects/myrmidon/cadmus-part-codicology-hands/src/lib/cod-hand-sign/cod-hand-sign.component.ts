import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocation, CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { NgToolsValidators } from '@myrmidon/ng-tools';

import { CodHandSign } from '../cod-hands-part';

@Component({
  selector: 'cadmus-cod-hand-sign',
  templateUrl: './cod-hand-sign.component.html',
  styleUrls: ['./cod-hand-sign.component.css'],
})
export class CodHandSignComponent implements OnInit {
  private _sign: CodHandSign | undefined;

  @Input()
  public get sign(): CodHandSign | undefined {
    return this._sign;
  }
  public set sign(value: CodHandSign | undefined) {
    if (this._sign === value) {
      return;
    }
    this._sign = value;
    this.updateForm(value);
  }

  // cod-hand-sign-types
  @Input()
  public typeEntries: ThesaurusEntry[] | undefined;

  @Output()
  public signChange: EventEmitter<CodHandSign>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl<string | null>;
  public type: FormControl<string | null>;
  public sampleRanges: FormControl<CodLocationRange[] | null>;
  public description: FormControl<string | null>;
  public form: FormGroup;

  public initialRanges?: CodLocationRange[];

  constructor(formBuilder: FormBuilder) {
    this.signChange = new EventEmitter<CodHandSign>();
    this.editorClose = new EventEmitter<any>();

    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.sampleRanges = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.description = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      eid: this.eid,
      type: this.type,
      sampleRanges: this.sampleRanges,
      description: this.description,
    });
  }

  ngOnInit(): void {
    if (this._sign) {
      this.updateForm(this._sign);
    }
  }

  private updateForm(sign: CodHandSign | undefined): void {
    if (!sign) {
      this.form.reset();
      return;
    }

    this.eid.setValue(sign.eid || null);
    this.type.setValue(sign.type);
    this.initialRanges = sign.sampleLocation
      ? [{ start: sign.sampleLocation, end: sign.sampleLocation }]
      : [];
    this.description.setValue(sign.description || null);

    this.form.markAsPristine();
  }

  private getSign(): CodHandSign {
    return {
      eid: this.eid.value?.trim(),
      type: this.type.value?.trim() || '',
      sampleLocation: this.sampleRanges.value?.length
        ? this.sampleRanges.value[0].start
        : ({} as CodLocation),
      description: this.description.value?.trim(),
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.sampleRanges.setValue(ranges || null);
    this.sampleRanges.updateValueAndValidity();
    this.sampleRanges.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._sign = this.getSign();
    this.signChange.emit(this._sign);
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

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

  public eid: FormControl;
  public type: FormControl;
  public sampleLocation: FormControl;
  public description: FormControl;
  public form: FormGroup;

  public initialRange?: CodLocationRange;

  constructor(formBuilder: FormBuilder) {
    this.signChange = new EventEmitter<CodHandSign>();
    this.editorClose = new EventEmitter<any>();

    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.sampleLocation = formBuilder.control(null, Validators.required);
    this.description = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      eid: this.eid,
      type: this.type,
      sampleLocation: this.sampleLocation,
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

    this.eid.setValue(sign.eid);
    this.type.setValue(sign.type);
    this.initialRange = sign.sampleLocation
      ? { start: sign.sampleLocation, end: sign.sampleLocation }
      : undefined;
    this.description.setValue(sign.description);

    this.form.markAsPristine();
  }

  private getSign(): CodHandSign | null {
    return {
      eid: this.eid.value?.trim(),
      type: this.type.value?.trim(),
      sampleLocation: this.sampleLocation.value,
      description: this.description.value?.trim(),
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.sampleLocation.setValue(ranges ? ranges[0].start : null);
    this.sampleLocation.updateValueAndValidity();
    this.sampleLocation.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    const model = this.getSign();
    if (!model) {
      return;
    }
    this.signChange.emit(model);
  }
}

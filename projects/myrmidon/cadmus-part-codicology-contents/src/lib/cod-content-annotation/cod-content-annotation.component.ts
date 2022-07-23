import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodContentAnnotation } from '../cod-contents-part';

@Component({
  selector: 'cadmus-cod-content-annotation',
  templateUrl: './cod-content-annotation.component.html',
  styleUrls: ['./cod-content-annotation.component.css'],
})
export class CodContentAnnotationComponent implements OnInit {
  private _annotation: CodContentAnnotation | undefined;

  @Input()
  public get annotation(): CodContentAnnotation | undefined {
    return this._annotation;
  }
  public set annotation(value: CodContentAnnotation | undefined) {
    this._annotation = value;
    this.updateForm(value);
  }

  // cod-content-annotation-types
  @Input()
  public typeEntries: ThesaurusEntry[] | undefined;

  @Output()
  public annotationChange: EventEmitter<CodContentAnnotation>;
  @Output()
  public editorClose: EventEmitter<any>;

  public type: FormControl<string | null>;
  public range: FormControl<CodLocationRange | null>;
  public incipit: FormControl<string | null>;
  public explicit: FormControl<string | null>;
  public text: FormControl<string | null>;
  public form: FormGroup;

  public initialRange?: CodLocationRange;

  constructor(formBuilder: FormBuilder) {
    this.annotationChange = new EventEmitter<CodContentAnnotation>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.range = formBuilder.control(null, Validators.required);
    this.incipit = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(500),
    ]);
    this.explicit = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(500),
    ]);
    this.text = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(1000),
    ]);
    this.form = formBuilder.group({
      type: this.type,
      range: this.range,
      incipit: this.incipit,
      explicit: this.explicit,
      text: this.text,
    });
  }

  ngOnInit(): void {
    if (this._annotation) {
      this.updateForm(this._annotation);
    }
  }

  private updateForm(model: CodContentAnnotation | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.type.setValue(model.type);
    this.initialRange = model.range;
    this.incipit.setValue(model.incipit);
    this.explicit.setValue(model.explicit);
    this.text.setValue(model.text);
    this.form.markAsPristine();
  }

  private getModel(): CodContentAnnotation | null {
    return {
      type: this.type.value?.trim() || '',
      range: this.range.value!,
      incipit: this.incipit.value?.trim() || '',
      explicit: this.explicit.value?.trim() || '',
      text: this.text.value?.trim() || '',
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.range.setValue(ranges?.length ? ranges[0] : null);
    this.range.updateValueAndValidity();
    this.range.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    const model = this.getModel();
    if (!model) {
      return;
    }
    this.annotationChange.emit(model);
  }
}

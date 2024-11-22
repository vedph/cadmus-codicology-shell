import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { NgToolsValidators } from '@myrmidon/ng-tools';

import { CodContentAnnotation } from '../cod-contents-part';

@Component({
  selector: 'cadmus-cod-content-annotation',
  templateUrl: './cod-content-annotation.component.html',
  styleUrls: ['./cod-content-annotation.component.css'],
  standalone: false,
})
export class CodContentAnnotationComponent implements OnInit {
  private _annotation: CodContentAnnotation | undefined;

  @Input()
  public get annotation(): CodContentAnnotation | undefined {
    return this._annotation;
  }
  public set annotation(value: CodContentAnnotation | undefined) {
    if (this._annotation === value) {
      return;
    }
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
  public ranges: FormControl<CodLocationRange[]>;
  public incipit: FormControl<string | null>;
  public explicit: FormControl<string | null>;
  public text: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.annotationChange = new EventEmitter<CodContentAnnotation>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.ranges = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.incipit = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(500),
    ]);
    this.explicit = formBuilder.control(null, Validators.maxLength(500));
    this.text = formBuilder.control(null, Validators.maxLength(1000));
    this.note = formBuilder.control(null, Validators.maxLength(5000));
    this.form = formBuilder.group({
      type: this.type,
      ranges: this.ranges,
      incipit: this.incipit,
      explicit: this.explicit,
      note: this.note,
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
    this.ranges.setValue([model.range]);
    this.incipit.setValue(model.incipit);
    this.explicit.setValue(model.explicit || null);
    this.text.setValue(model.text || null);
    this.note.setValue(model.note || null);
    this.form.markAsPristine();
  }

  private getModel(): CodContentAnnotation {
    return {
      type: this.type.value?.trim() || '',
      range: this.ranges.value.length ? this.ranges.value[0] : (null as any),
      incipit: this.incipit.value?.trim() || '',
      explicit: this.explicit.value?.trim() || '',
      text: this.text.value?.trim() || '',
      note: this.note.value?.trim() || undefined,
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._annotation = this.getModel();
    this.annotationChange.emit(this._annotation);
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { CodShelfmark } from '../cod-shelfmarks-part';

@Component({
  selector: 'cadmus-cod-shelfmark-editor',
  templateUrl: './cod-shelfmark-editor.component.html',
  styleUrls: ['./cod-shelfmark-editor.component.css'],
})
export class CodShelfmarkEditorComponent implements OnInit {
  private _shelfmark: CodShelfmark | undefined;

  @Input()
  public get shelfmark(): CodShelfmark | undefined {
    return this._shelfmark;
  }
  public set shelfmark(value: CodShelfmark | undefined) {
    this._shelfmark = value;
    this.updateForm(value);
  }

  // cod-shelfmark-tags
  @Input()
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-shelfmark-libraries
  @Input()
  public libEntries: ThesaurusEntry[] | undefined;

  @Output()
  public shelfmarkChange: EventEmitter<CodShelfmark>;
  @Output()
  public editorClose: EventEmitter<any>;

  public tag: UntypedFormControl;
  public city: UntypedFormControl;
  public library: UntypedFormControl;
  public fund: UntypedFormControl;
  public location: UntypedFormControl;
  public form: UntypedFormGroup;

  constructor(formBuilder: UntypedFormBuilder) {
    this.shelfmarkChange = new EventEmitter<CodShelfmark>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.city = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.library = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.fund = formBuilder.control(null, Validators.maxLength(50));
    this.location = formBuilder.control(null, Validators.maxLength(50));

    this.form = formBuilder.group({
      tag: this.tag,
      city: this.city,
      library: this.library,
      fund: this.fund,
      location: this.location,
    });
  }

  ngOnInit(): void {
    if (this._shelfmark) {
      this.updateForm(this._shelfmark);
    }
  }

  private updateForm(model: CodShelfmark | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.tag.setValue(model.tag);
    this.city.setValue(model.city);
    this.library.setValue(model.library);
    this.fund.setValue(model.fund);
    this.location.setValue(model.location);
    this.form.markAsPristine();
  }

  private getModel(): CodShelfmark | null {
    return {
      tag: this.tag.value?.trim(),
      city: this.city.value?.trim(),
      library: this.library.value?.trim(),
      fund: this.fund.value?.trim(),
      location: this.location.value?.trim(),
    };
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
    this.shelfmarkChange.emit(model);
  }
}

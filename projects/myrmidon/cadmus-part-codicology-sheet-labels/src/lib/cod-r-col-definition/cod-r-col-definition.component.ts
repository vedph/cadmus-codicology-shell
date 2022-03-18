import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodRColDefinition } from '../cod-sheet-labels-part';

@Component({
  selector: 'cadmus-cod-r-col-definition',
  templateUrl: './cod-r-col-definition.component.html',
  styleUrls: ['./cod-r-col-definition.component.css'],
})
export class CodRColDefinitionComponent implements OnInit {
  private _definition: CodRColDefinition | undefined;

  @Input()
  public get definition(): CodRColDefinition | undefined {
    return this._definition;
  }
  public set definition(value: CodRColDefinition | undefined) {
    this._definition = value;
    this.updateForm(value);
  }

  // cod-quiresig-positions
  @Input()
  public posEntries: ThesaurusEntry[] | undefined;

  @Output()
  public definitionChange: EventEmitter<CodRColDefinition>;
  @Output()
  public editorClose: EventEmitter<any>;

  public id: string;
  public rank: FormControl;
  public position: FormControl;
  public note: FormControl;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.definitionChange = new EventEmitter<CodRColDefinition>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.id = '';
    this.rank = formBuilder.control(0);
    this.position = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      id: this.id,
      rank: this.rank,
      position: this.position,
      note: this.note,
    });
  }

  ngOnInit(): void {
    if (this._definition) {
      this.updateForm(this._definition);
    }
  }

  private updateForm(model: CodRColDefinition | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.id = model.id;
    this.rank.setValue(model.rank || 0);
    this.position.setValue(model.position);
    this.note.setValue(model.note);
    this.form.markAsPristine();
  }

  private getModel(): CodRColDefinition {
    return {
      id: this.id,
      rank: +this.rank.value || 0,
      position: this.position.value?.trim(),
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
    this.definitionChange.emit(this.getModel());
  }
}

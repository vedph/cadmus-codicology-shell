import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodCColDefinition } from '../cod-sheet-labels-part';

@Component({
  selector: 'cadmus-cod-c-col-definition',
  templateUrl: './cod-c-col-definition.component.html',
  styleUrls: ['./cod-c-col-definition.component.css'],
})
export class CodCColDefinitionComponent implements OnInit {
  private _definition: CodCColDefinition | undefined;

  @Input()
  public get definition(): CodCColDefinition | undefined {
    return this._definition;
  }
  public set definition(value: CodCColDefinition | undefined) {
    this._definition = value;
    this.updateForm(value);
  }

  // cod-catchwords-positions
  @Input()
  public posEntries: ThesaurusEntry[] | undefined;

  @Output()
  public definitionChange: EventEmitter<CodCColDefinition>;
  @Output()
  public editorClose: EventEmitter<any>;

  public id: string;
  public rank: FormControl;
  public position: FormControl;
  public isVertical: FormControl;
  public decoration: FormControl;
  public note: FormControl;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.definitionChange = new EventEmitter<CodCColDefinition>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.id = '';
    this.rank = formBuilder.control(0);
    this.position = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.isVertical = formBuilder.control(false);
    this.decoration = formBuilder.control(null, Validators.maxLength(1000));
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      rank: this.rank,
      position: this.position,
      isVertical: this.isVertical,
      decoration: this.decoration,
      note: this.note,
    });
  }

  ngOnInit(): void {
    if (this._definition) {
      this.updateForm(this._definition);
    }
  }

  private updateForm(model: CodCColDefinition | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.id = model.id;
    this.rank.setValue(model.rank || 0);
    this.position.setValue(model.position);
    this.isVertical.setValue(model.isVertical ? true : false);
    this.decoration.setValue(model.decoration);
    this.note.setValue(model.note);
    this.form.markAsPristine();
  }

  private getModel(): CodCColDefinition {
    return {
      id: this.id,
      rank: +this.rank.value || 0,
      position: this.position.value?.trim(),
      isVertical: this.isVertical.value ? true : false,
      decoration: this.decoration.value?.trim(),
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

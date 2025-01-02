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
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodSColDefinition } from '../cod-sheet-labels-part';

@Component({
  selector: 'cadmus-cod-s-col-definition',
  templateUrl: './cod-s-col-definition.component.html',
  styleUrls: ['./cod-s-col-definition.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatError,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodSColDefinitionComponent implements OnInit {
  private _definition: CodSColDefinition | undefined;

  @Input()
  public get definition(): CodSColDefinition | undefined {
    return this._definition;
  }
  public set definition(value: CodSColDefinition | undefined) {
    if (this._definition === value) {
      return;
    }
    this._definition = value;
    this.updateForm(value);
  }

  // cod-quiresig-systems
  @Input()
  public sysEntries: ThesaurusEntry[] | undefined;

  // cod-quiresig-positions
  @Input()
  public posEntries: ThesaurusEntry[] | undefined;

  @Output()
  public definitionChange: EventEmitter<CodSColDefinition>;
  @Output()
  public editorClose: EventEmitter<any>;

  public id: string;
  public rank: FormControl<number>;
  public system: FormControl<string | null>;
  public position: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.definitionChange = new EventEmitter<CodSColDefinition>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.id = '';
    this.rank = formBuilder.control(0, { nonNullable: true });
    this.system = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.position = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      rank: this.rank,
      system: this.system,
      position: this.position,
      note: this.note,
    });
  }

  ngOnInit(): void {
    if (this._definition) {
      this.updateForm(this._definition);
    }
  }

  private updateForm(model: CodSColDefinition | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.id = model.id;
    this.rank.setValue(model.rank || 0);
    this.system.setValue(model.system);
    this.position.setValue(model.position);
    this.note.setValue(model.note || null);
    this.form.markAsPristine();
  }

  private getModel(): CodSColDefinition {
    return {
      id: this.id,
      rank: +this.rank.value || 0,
      system: this.system.value?.trim() || '',
      position: this.position.value?.trim() || '',
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
    this._definition = this.getModel();
    this.definitionChange.emit(this._definition);
  }
}

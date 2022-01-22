import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PhysicalSize } from '@myrmidon/cadmus-mat-physical-size';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { CodBinding } from '../cod-bindings-part';

@Component({
  selector: 'cadmus-cod-binding-editor',
  templateUrl: './cod-binding-editor.component.html',
  styleUrls: ['./cod-binding-editor.component.css'],
})
export class CodBindingEditorComponent implements OnInit {
  private _binding: CodBinding | undefined;

  @Input()
  public get binding(): CodBinding | undefined {
    return this._binding;
  }
  public set binding(value: CodBinding | undefined) {
    this._binding = value;
    this.updateForm(value);
  }

  // cod-binding-tags
  @Input()
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-binding-cover-materials
  @Input()
  public coverEntries: ThesaurusEntry[] | undefined;
  // cod-binding-board-materials
  @Input()
  public boardEntries: ThesaurusEntry[] | undefined;
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
  // physical-size-tags
  @Input()
  public szTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-dim-tags
  @Input()
  public szDimTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-units
  @Input()
  public szUnitEntries: ThesaurusEntry[] | undefined;

  @Output()
  public bindingChange: EventEmitter<CodBinding>;
  @Output()
  public editorClose: EventEmitter<any>;

  public tag: FormControl;
  public coverMaterial: FormControl;
  public boardMaterial: FormControl;
  public chronotope: FormControl;
  public size: FormControl;
  public description: FormControl;
  public form: FormGroup;

  public initialSize?: PhysicalSize;
  public initialChronotope?: AssertedChronotope;

  constructor(formBuilder: FormBuilder) {
    this.bindingChange = new EventEmitter<CodBinding>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.coverMaterial = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.boardMaterial = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.chronotope = formBuilder.control(null, Validators.required);
    this.size = formBuilder.control(null);
    this.description = formBuilder.control(null, Validators.maxLength(5000));
    this.form = formBuilder.group({
      tag: this.tag,
      coverMaterial: this.coverMaterial,
      boardMaterial: this.boardMaterial,
      chronotope: this.chronotope,
      size: this.size,
      description: this.description,
    });
  }

  ngOnInit(): void {
    if (this._binding) {
      this.updateForm(this._binding);
    }
  }

  private updateForm(model: CodBinding | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.tag.setValue(model.tag);
    this.coverMaterial.setValue(model.coverMaterial);
    this.boardMaterial.setValue(model.boardMaterial);
    this.description.setValue(model.description);
    this.initialSize = model.size;
    this.initialChronotope = model.chronotope;
    this.form.markAsPristine();
  }

  private getModel(): CodBinding | null {
    return {
      tag: this.tag.value?.trim(),
      coverMaterial: this.coverMaterial.value?.trim(),
      boardMaterial: this.boardMaterial.value?.trim(),
      chronotope: this.chronotope.value,
      size: this.size.value,
      description: this.description.value?.trim(),
    };
  }

  public onSizeChange(size: PhysicalSize): void {
    this.size.setValue(size);
    this.size.markAsDirty();
  }

  public onChronotopeChange(chronotope: AssertedChronotope | undefined): void {
    this.chronotope.setValue(chronotope);
    this.chronotope.markAsDirty();
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
    this.bindingChange.emit(model);
  }
}

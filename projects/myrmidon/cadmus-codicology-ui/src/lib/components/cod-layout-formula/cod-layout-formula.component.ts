import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import '@myrmidon/cod-layout-view';
import {
  PhysicalDimension,
  PhysicalDimensionComponent,
} from '@myrmidon/cadmus-mat-physical-size';
import {
  CodLayoutFormulaService,
  createLayoutFormulaService,
  ITCodLayoutFormulaService,
} from '@myrmidon/cod-layout-view';
import { DialogService } from '@myrmidon/ngx-mat-tools';

/**
 * Codicological layout formula with dimensions.
 */
export interface CodLayoutFormulaWithDimensions {
  prefix?: 'IT' | 'BO';
  formula: string;
  dimensions: PhysicalDimension[];
}

/**
 * A component to edit a layout formula and its dimensions.
 * It uses the `cod-layout-view` component to display the formula.
 * When the user requests to import the formula dimensions,
 * it parses the formula and adds the dimensions to the list,
 * replacing those with the same label.
 * Conversely, when the user changes dimensions and requests to
 * update the formula, it generates a new formula from the old one
 * and the dimensions.
 */
@Component({
  selector: 'cadmus-cod-layout-formula',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    PhysicalDimensionComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cod-layout-formula.component.html',
  styleUrls: ['./cod-layout-formula.component.css'],
})
export class CodLayoutFormulaComponent {
  private _formulaService: CodLayoutFormulaService =
    new ITCodLayoutFormulaService();
  private _updatingForm = false;

  public editedIndex = -1;
  public edited?: PhysicalDimension;

  /**
   * Custom validator for formula validation using the formula service.
   */
  private formulaValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    if (!control.value) {
      return null; // let required validator handle empty values
    }

    const validationResult = this._formulaService.validateFormula(
      control.value
    );
    if (validationResult) {
      return {
        formulaInvalid: {
          message: validationResult,
        },
      };
    }

    return null;
  };

  /**
   * The data to edit.
   */
  public readonly data = model<CodLayoutFormulaWithDimensions>();

  public readonly cancelEdit = output();

  public formulaCtl: FormControl<string>;
  public dimensionsCtl: FormControl<PhysicalDimension[]>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    this.formulaCtl = formBuilder.control(this.data()?.formula || '', {
      validators: [
        Validators.required,
        Validators.maxLength(500),
        this.formulaValidator,
      ],
      nonNullable: true,
    });
    this.dimensionsCtl = formBuilder.control(this.data()?.dimensions || [], {
      nonNullable: true,
    });
    this.form = formBuilder.group({
      formula: this.formulaCtl,
      dimensions: this.dimensionsCtl,
    });

    // when data changes, update service and controls
    effect(() => {
      if (this._updatingForm) {
        return;
      }
      this._updatingForm = true;

      // update the service
      this._formulaService = createLayoutFormulaService(this.data()?.prefix);

      // update the formula control validators to use the new service
      this.formulaCtl.setValidators([
        Validators.required,
        Validators.maxLength(500),
        this.formulaValidator,
      ]);
      this.formulaCtl.updateValueAndValidity();

      // update the formula control
      const formula = this.data()?.formula;
      this.formulaCtl.setValue(formula || '', { emitEvent: false });
      this.formulaCtl.markAsPristine();

      // update the dimensions control
      const dimensions = this.data()?.dimensions || [];
      this.dimensionsCtl.setValue(dimensions, { emitEvent: false });
      this.dimensionsCtl.markAsPristine();

      this._updatingForm = false;
    });
  }

  public updateDimensionsFromFormula(): void {
    // if the formula is empty, do nothing
    if (!this.formulaCtl.value) {
      return;
    }

    // parse the formula and get the spans
    const formula = this._formulaService.parseFormula(this.formulaCtl.value);
    if (!formula?.width || !formula?.height || !formula?.spans?.length) {
      return;
    }

    // sort spans by isHorizontal and then by label including height and width
    const spans = [
      {
        isHorizontal: false,
        label: formula.height.label || 'height',
        value: formula.height.value || 0,
      },
      {
        isHorizontal: true,
        label: formula.width.label || 'width',
        value: formula.width.value || 0,
      },
      ...formula.spans,
    ];
    spans.sort((a, b) => {
      if (a.isHorizontal !== b.isHorizontal) {
        return a.isHorizontal ? -1 : 1;
      }
      return (a.label || '').localeCompare(b.label || '');
    });

    // add each span as a dimension replacing those with the same label
    const dimensions = [...(this.dimensionsCtl.value || [])];

    // remove all the dimensions whose tag is any of the formula's labels
    const allDimensionTags = dimensions.map((d) => d.tag!);
    const formulaLabels = new Set(
      this._formulaService.filterFormulaLabels(formula, allDimensionTags)
    );

    // remove dimensions that are formula-derived
    const filteredDimensions = dimensions.filter(
      (d) => !formulaLabels.has(d.tag!)
    );

    for (const span of spans) {
      const existingIndex = filteredDimensions.findIndex(
        (d) => d.tag === span.label
      );
      if (existingIndex !== -1) {
        filteredDimensions[existingIndex] = {
          tag: span.label || '',
          value: span.value || 0,
          unit: formula.unit || 'mm',
        };
      } else {
        filteredDimensions.push({
          tag: span.label || '',
          value: span.value || 0,
          unit: formula.unit || 'mm',
        });
      }
    }
    this.dimensionsCtl.setValue(filteredDimensions, { emitEvent: false });
    this.dimensionsCtl.markAsDirty();
    this.dimensionsCtl.updateValueAndValidity();
  }

  public updateFormulaFromDimensions(): void {
    // if there are no dimensions, do nothing
    if (!this.dimensionsCtl.value.length) {
      return;
    }

    // parse formula from its string value
    const parsedFormula = this._formulaService.parseFormula(
      this.formulaCtl.value
    );
    if (!parsedFormula) {
      return;
    }

    // get formula-related labels
    const formulaLabels = new Set(
      this._formulaService.filterFormulaLabels(
        parsedFormula,
        this.dimensionsCtl.value.map((d) => d.tag!)
      )
    );

    // update formula's height, width, and spans where any dimension
    // has a label matching the formula's labels
    const dimensions = this.dimensionsCtl.value || [];
    for (const dimension of dimensions.filter((d) =>
      formulaLabels.has(d.tag!)
    )) {
      // height and width are special cases
      if (dimension.tag === 'height') {
        parsedFormula.height = {
          label: dimension.tag || 'height',
          value: dimension.value || 0,
        };
      } else if (dimension.tag === 'width') {
        parsedFormula.width = {
          label: dimension.tag || 'width',
          value: dimension.value || 0,
        };
      } else {
        // for other dimensions, update existing span or add new
        const existingSpan = parsedFormula?.spans.find(
          (span) => span.label === dimension.tag
        );
        if (existingSpan) {
          existingSpan.value = dimension.value || 0;
        } else {
          parsedFormula?.spans.push({
            label: dimension.tag || '',
            value: dimension.value || 0,
          });
        }
      }
    }

    // update the formula control value
    const value = this._formulaService.buildFormula(parsedFormula);
    if (value) {
      this.formulaCtl.setValue(value, { emitEvent: false });
      this.formulaCtl.markAsDirty();
      this.formulaCtl.updateValueAndValidity();
    }
  }

  public addDimension(): void {
    const entry: PhysicalDimension = {
      tag: '',
      value: 0,
      unit: 'mm',
    };
    this.editDimension(entry, -1);
  }

  public editDimension(entry: PhysicalDimension, index: number): void {
    this.editedIndex = index;
    this.edited = entry;
  }

  public closeDimension(): void {
    this.editedIndex = -1;
    this.edited = undefined;
  }

  public saveDimension(dimension: PhysicalDimension): void {
    const entries = [...this.dimensionsCtl.value];
    if (this.editedIndex === -1) {
      entries.push(dimension);
    } else {
      entries.splice(this.editedIndex, 1, dimension);
    }
    this.dimensionsCtl.setValue(entries);
    this.dimensionsCtl.markAsDirty();
    this.dimensionsCtl.updateValueAndValidity();
    this.closeDimension();
  }

  public deleteDimension(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete Dimension?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex === index) {
            this.closeDimension();
          }
          const dimensions = [...this.dimensionsCtl.value];
          dimensions.splice(index, 1);
          this.dimensionsCtl.setValue(dimensions);
          this.dimensionsCtl.markAsDirty();
          this.dimensionsCtl.updateValueAndValidity();
        }
      });
  }

  public moveDimensionUp(index: number): void {
    if (index < 1) {
      return;
    }
    const dimension = this.dimensionsCtl.value[index];
    const dimensions = [...this.dimensionsCtl.value];
    dimensions.splice(index, 1);
    dimensions.splice(index - 1, 0, dimension);
    this.dimensionsCtl.setValue(dimensions);
    this.dimensionsCtl.markAsDirty();
    this.dimensionsCtl.updateValueAndValidity();
  }

  public moveDimensionDown(index: number): void {
    if (index + 1 >= this.dimensionsCtl.value.length) {
      return;
    }
    const dimension = this.dimensionsCtl.value[index];
    const dimensions = [...this.dimensionsCtl.value];
    dimensions.splice(index, 1);
    dimensions.splice(index + 1, 0, dimension);
    this.dimensionsCtl.setValue(dimensions);
    this.dimensionsCtl.markAsDirty();
    this.dimensionsCtl.updateValueAndValidity();
  }

  private getData(): CodLayoutFormulaWithDimensions {
    return {
      prefix: this.data()?.prefix,
      formula: this.formulaCtl.value,
      dimensions: this.dimensionsCtl.value,
    };
  }

  public cancel(): void {
    this.cancelEdit.emit();
  }

  public save(pristine = true): void {
    if (this.form.invalid) {
      // show validation errors
      this.form.markAllAsTouched();
      return;
    }

    const data = this.getData();
    this.data.set(data);

    if (pristine) {
      this.form.markAsPristine();
    }
  }
}

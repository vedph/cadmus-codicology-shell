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
import { MatExpansionModule } from '@angular/material/expansion';
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
  CodLayoutFormula,
  CodLayoutFormulaService,
  createLayoutFormulaService,
  ITCodLayoutFormulaService,
} from '@myrmidon/cod-layout-view';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import {
  CodOrdinalEditorComponent,
  CodOrdinalValue,
} from '../cod-ordinal-editor/cod-ordinal-editor.component';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

/**
 * Codicological layout formula with dimensions.
 */
export interface CodLayoutFormulaWithDimensions {
  prefix?: 'IT' | 'BO';
  formula: string;
  dimensions: PhysicalDimension[];
}

/**
 * Ordered physical dimension.
 * This extends PhysicalDimension with an ordinal property.
 */
interface OrderedPhysicalDimension extends PhysicalDimension {
  ordinal: number;
}

/**
 * A component to edit a layout formula and its dimensions.
 * This uses the `cod-layout-view` web component to display
 * the formula.
 * When the user requests to import formula dimensions,
 * it parses the formula and adds the dimensions to the list,
 * replacing those with the same label.
 * Conversely, when the user changes dimensions and requests to
 * update the formula, it generates a new formula from the old one
 * and the dimensions. To generate the formula, the component needs
 * to add the ordinal number to each dimension, so that it can
 * process them in order. These ordinals are stored in the
 * OrderedPhysicalDimension interface, which extends
 * PhysicalDimension with an ordinal property. The ordinal is
 * an artifact used only within the boundaries of this component
 * and is not stored in the data model. Those dimensions not
 * derived from the formula have ordinal 0, and height and width
 * dimensions have ordinals 1 and 2, respectively.
 */
@Component({
  selector: 'cadmus-cod-layout-formula',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    PhysicalDimensionComponent,
    CodOrdinalEditorComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cod-layout-formula.component.html',
  styleUrls: ['./cod-layout-formula.component.css'],
})
export class CodLayoutFormulaComponent {
  private _formulaService: CodLayoutFormulaService =
    new ITCodLayoutFormulaService();
  private _updatingForm = false;
  private _editedOrdinal = 0;
  /**
   * Custom validator for formula validation using the formula service.
   */
  private formulaValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    if (!control.value) {
      return null; // let required validator handle empty values
    }

    const errors = this._formulaService.validateFormula(control.value);
    if (errors) {
      return {
        // convert errors into array of error messages
        formulaErrors: [...Object.keys(errors).map((k) => errors[k])],
      };
    }

    return null;
  };

  // the currently edited dimension
  public editedIndex = -1;
  public edited?: OrderedPhysicalDimension;

  // the currently edited ordinal value
  public editedOrdinalIndex = -1;
  public editedOrdinalValue?: CodOrdinalValue;

  /**
   * The data to edit.
   */
  public readonly data = model<CodLayoutFormulaWithDimensions>();

  /**
   * Thesaurus entries for physical-size-units.
   */
  public readonly unitEntries = input<ThesaurusEntry[]>([
    { id: 'mm', value: 'mm' },
    { id: 'cm', value: 'cm' },
  ]);

  /**
   * Thesaurus entries for physical-size-dim-tags.
   */
  public readonly tagEntries = input<ThesaurusEntry[]>();

  /**
   * An output to signal that the user has requested to cancel the edit.
   */
  public readonly cancelEdit = output();

  public formulaCtl: FormControl<string>;
  public dimensionsCtl: FormControl<OrderedPhysicalDimension[]>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    // formula
    this.formulaCtl = formBuilder.control(this.data()?.formula || '', {
      validators: [
        Validators.required,
        Validators.maxLength(500),
        this.formulaValidator,
      ],
      nonNullable: true,
    });
    // dimensions
    this.dimensionsCtl = formBuilder.control(
      this.data()?.dimensions.map(
        (d, i) => ({ ...d, ordinal: i + 3 } as OrderedPhysicalDimension)
      ) || [],
      {
        nonNullable: true,
      }
    );
    // form
    this.form = formBuilder.group({
      formula: this.formulaCtl,
      dimensions: this.dimensionsCtl,
    });

    // when data changes, update service and form
    effect(() => {
      if (this._updatingForm) {
        return;
      }
      this._updatingForm = true;

      // close any open dimension or ordinal editors
      this.closeDimension();

      // update the formula service
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
      const rawDimensions = this.data()?.dimensions || [];
      const dimensions: OrderedPhysicalDimension[] = [];

      // if there are dimensions and a formula, we need to determine ordinals
      if (rawDimensions.length > 0 && formula) {
        // parse the current formula to determine which dimensions are formula-derived
        let parsedFormula: CodLayoutFormula | null | undefined = null;
        try {
          parsedFormula = this._formulaService.parseFormula(formula)?.result;
        } catch (error) {
          console.warn('Error parsing formula:', formula, error);
        }
        // only proceed if the formula was parsed successfully
        if (parsedFormula) {
          // get all dimensions tags
          const allDimensionTags = rawDimensions
            .map((d) => d.tag!)
            .filter((tag) => tag);

          // filter to get only formula-derived labels
          const formulaLabels = new Set(
            this._formulaService.filterFormulaLabels(
              parsedFormula,
              allDimensionTags
            )
          );
          formulaLabels.add('height');
          formulaLabels.add('width');

          // assign ordinals based on formula structure
          const spanOrdinals = new Map<string, number>();

          if (parsedFormula.spans?.length) {
            let spanIndex = 0;
            parsedFormula.spans.forEach((span) => {
              if (span.label && formulaLabels.has(span.label)) {
                spanOrdinals.set(span.label, 3 + spanIndex++);
              }
            });
          }

          // assign ordinals to dimensions
          rawDimensions.forEach((d) => {
            let ordinal = 0; // default for custom dimensions

            if (d.tag && formulaLabels.has(d.tag)) {
              // this is a formula-derived dimension
              if (parsedFormula.height?.label || 'height' === d.tag) {
                ordinal = 1;
              } else if (parsedFormula.width?.label || 'width' === d.tag) {
                ordinal = 2;
              } else {
                ordinal = spanOrdinals.get(d.tag) || 0;
              }
            }

            dimensions.push({ ...d, ordinal } as OrderedPhysicalDimension);
          });
        } else {
          // fallback: if formula can't be parsed, treat all as custom (ordinal 0)
          rawDimensions.forEach((d) => {
            dimensions.push({ ...d, ordinal: 0 } as OrderedPhysicalDimension);
          });
        }
      } else {
        // no dimensions or no formula, treat all as custom
        rawDimensions.forEach((d) => {
          dimensions.push({ ...d, ordinal: 0 } as OrderedPhysicalDimension);
        });
      }

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
    let formula: CodLayoutFormula | null | undefined;
    try {
      formula = this._formulaService.parseFormula(
        this.formulaCtl.value
      )?.result;
      if (!formula?.width || !formula?.height) {
        return;
      }
    } catch (error) {
      console.warn('Error parsing formula:', this.formulaCtl.value, error);
      return;
    }

    // collect all formula-derived labels
    const formulaLabels = new Set<string>();
    formulaLabels.add(formula.height.label || 'height');
    formulaLabels.add(formula.width.label || 'width');
    if (formula.spans) {
      formula.spans.forEach((span) => {
        if (span.label) formulaLabels.add(span.label);
      });
    }

    // start with existing dimensions, keeping only non-formula ones
    const existingDimensions = [...(this.dimensionsCtl.value || [])];
    const nonFormulaDimensions = existingDimensions.filter(
      (d) => !formulaLabels.has(d.tag!)
    );

    // add formula-derived dimensions
    const newFormulaDimensions: OrderedPhysicalDimension[] = [];

    // add height
    newFormulaDimensions.push({
      tag: formula.height.label || 'height',
      value: formula.height.value || 0,
      unit: formula.unit || 'mm',
      ordinal: 1,
    });

    // add width
    newFormulaDimensions.push({
      tag: formula.width.label || 'width',
      value: formula.width.value || 0,
      unit: formula.unit || 'mm',
      ordinal: 2,
    });

    // add spans
    if (formula.spans) {
      let i = 0;
      formula.spans.forEach((span) => {
        if (span.label) {
          newFormulaDimensions.push({
            tag: span.label,
            value: span.value || 0,
            unit: formula.unit || 'mm',
            ordinal: 3 + i++,
          });
        }
      });
    }

    // combine non-formula dimensions with new formula dimensions
    // formula dimensions maintain their ordinal order, non-formula dimensions have ordinal 0
    const allDimensions = [...nonFormulaDimensions, ...newFormulaDimensions];
    // sort by ordinal first (formula dimensions 1,2,3... then non-formula 0), then by tag
    allDimensions.sort((a, b) => {
      if (a.ordinal !== b.ordinal) {
        return a.ordinal - b.ordinal;
      }
      return (a.tag || '').localeCompare(b.tag || '');
    });

    this.dimensionsCtl.setValue(allDimensions, { emitEvent: false });
    this.dimensionsCtl.markAsDirty();
    this.dimensionsCtl.updateValueAndValidity();
  }

  public updateFormulaFromDimensions(): void {
    // if there are no dimensions, do nothing
    if (!this.dimensionsCtl.value?.length) {
      return;
    }

    // store the original formula for comparison
    const originalFormula = this.formulaCtl.value;

    // parse formula from its string value
    let parsedFormula: CodLayoutFormula | null | undefined;
    try {
      parsedFormula =
        this._formulaService.parseFormula(originalFormula)?.result;
      if (!parsedFormula) {
        console.warn('Failed to parse formula:', originalFormula);
        return;
      }
    } catch (error) {
      console.warn('Error parsing formula:', originalFormula);
      return;
    }

    // only work with formula-derived dimensions (ordinal > 0)
    const formulaDimensions = this.dimensionsCtl.value.filter(
      (d) => d.ordinal > 0
    );
    if (formulaDimensions.length === 0) {
      console.log('No formula-derived dimensions to update');
      return;
    }

    // sort formula dimensions by ordinal to match original formula structure
    formulaDimensions.sort((a, b) => a.ordinal - b.ordinal);

    let hasChanges = false;

    // update height if it exists (ordinal 1)
    const heightDim = formulaDimensions.find((d) => d.ordinal === 1);
    if (parsedFormula.height?.label && heightDim) {
      if (heightDim.value !== parsedFormula.height.value) {
        parsedFormula.height.value = heightDim.value || 0;
        hasChanges = true;
        console.log(
          `Updated height ${parsedFormula.height.label}: ${heightDim.value}`
        );
      }
    }

    // update width if it exists (ordinal 2)
    const widthDim = formulaDimensions.find((d) => d.ordinal === 2);
    if (parsedFormula.width?.label && widthDim) {
      if (widthDim.value !== parsedFormula.width.value) {
        parsedFormula.width.value = widthDim.value || 0;
        hasChanges = true;
        console.log(
          `Updated width ${parsedFormula.width.label}: ${widthDim.value}`
        );
      }
    }

    // update spans using ordinal-based mapping (ordinal 3+)
    if (parsedFormula.spans) {
      const spanDimensions = formulaDimensions.filter((d) => d.ordinal >= 3);

      // create ordinal to dimension map for spans
      const ordinalToDimension = new Map<number, OrderedPhysicalDimension>();
      spanDimensions.forEach((dim) => {
        ordinalToDimension.set(dim.ordinal, dim);
      });

      parsedFormula.spans = parsedFormula.spans.map((span, index) => {
        if (span.label) {
          // find the dimension with the corresponding ordinal (3 + index)
          const expectedOrdinal = 3 + index;
          const spanDim = ordinalToDimension.get(expectedOrdinal);

          if (spanDim && spanDim.value !== span.value) {
            hasChanges = true;
            console.log(
              `Updated span ${span.label} (ordinal ${expectedOrdinal}): ${spanDim.value}`
            );
            return {
              ...span, // preserve all span properties
              value: spanDim.value || 0,
            };
          }
        }
        return span;
      });
    }

    // only rebuild if there are actual changes
    if (!hasChanges) {
      console.log(
        'No changes detected in formula-derived dimensions, skipping formula update'
      );
      return;
    }

    console.log(
      'Updated parsed formula:',
      JSON.stringify(parsedFormula, null, 2)
    );

    // rebuild and update the formula control value
    const newFormulaValue = this._formulaService.buildFormula(parsedFormula);
    console.log('Rebuilt formula:', newFormulaValue);

    if (newFormulaValue && newFormulaValue !== originalFormula) {
      // validate the new formula before applying it
      try {
        const reParseTest = this._formulaService.parseFormula(newFormulaValue);
        if (!reParseTest) {
          console.error('Rebuilt formula failed to parse, reverting');
          return;
        }
      } catch (error) {
        console.error('Error validating rebuilt formula:', error);
      }

      // set the value without emitting events initially to avoid recursive updates
      this.formulaCtl.setValue(newFormulaValue, { emitEvent: false });
      this.formulaCtl.markAsDirty();
      this.formulaCtl.markAsTouched(); // ensure validation errors show
      this.formulaCtl.updateValueAndValidity();

      // force validation state update by triggering value change detection
      this.formulaCtl.setValue(newFormulaValue, { emitEvent: true });

      console.log('Formula updated successfully');
    } else if (!newFormulaValue) {
      console.error('Failed to rebuild formula from parsed structure');
    }
  }

  public addDimension(): void {
    const entry: OrderedPhysicalDimension = {
      tag: '',
      value: 0,
      unit: 'mm',
      ordinal: 0,
    };
    this.editDimension(entry, -1);
  }

  public editDimension(entry: OrderedPhysicalDimension, index: number): void {
    this._editedOrdinal = entry.ordinal;
    this.editedIndex = index;
    this.edited = entry;
  }

  public closeDimension(): void {
    this._editedOrdinal = 0;
    this.editedIndex = -1;
    this.edited = undefined;

    this.closeOrdinal();
  }

  public saveDimension(dimension: PhysicalDimension): void {
    const entries = [...this.dimensionsCtl.value];
    const dimensionWithOrdinal = { ...dimension, ordinal: this._editedOrdinal };

    if (this.editedIndex === -1) {
      // adding a new dimension
      // check if a dimension with the same tag already exists and remove it
      const existingIndex = entries.findIndex(
        (d) => d.tag === dimension.tag && d.tag
      );
      if (existingIndex !== -1) {
        entries.splice(existingIndex, 1);
      }
      entries.push(dimensionWithOrdinal);
    } else {
      // editing an existing dimension
      const originalDimension = this.dimensionsCtl.value[this.editedIndex];
      const originalTag = originalDimension?.tag;
      const newTag = dimension.tag;

      // if the tag changed, we need to handle potential duplicates
      if (originalTag !== newTag) {
        // remove any existing dimension with the new tag (to avoid duplicates)
        const duplicateIndex = entries.findIndex(
          (d, index) => d.tag === newTag && d.tag && index !== this.editedIndex
        );
        if (duplicateIndex !== -1) {
          // if the duplicate is before our edited index, adjust the edited index
          if (duplicateIndex < this.editedIndex) {
            this.editedIndex--;
          }
          entries.splice(duplicateIndex, 1);
        }
      }

      // replace the dimension at the edited index
      entries.splice(this.editedIndex, 1, dimensionWithOrdinal);
    }

    this.dimensionsCtl.setValue(entries);
    this.dimensionsCtl.markAsDirty();
    this.dimensionsCtl.updateValueAndValidity();
    this.closeDimension();

    this.updateFormulaFromDimensions();
  }

  public deleteDimension(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete Dimension?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          this.closeOrdinal();
          if (this.editedIndex === index) {
            this.closeDimension();
          }
          const dimensions = [...this.dimensionsCtl.value];
          dimensions.splice(index, 1);
          this.dimensionsCtl.setValue(dimensions);
          this.dimensionsCtl.markAsDirty();
          this.dimensionsCtl.updateValueAndValidity();

          this.updateFormulaFromDimensions();
        }
      });
  }

  public moveDimensionUp(index: number): void {
    if (index < 1) {
      return;
    }
    this.closeDimension();
    const dimensions = [...this.dimensionsCtl.value];
    const currentDimension = dimensions[index];
    const targetDimension = dimensions[index - 1];

    // if both dimensions have ordinals (are formula-derived), swap their ordinals
    if (currentDimension.ordinal > 0 && targetDimension.ordinal > 0) {
      const tempOrdinal = currentDimension.ordinal;
      currentDimension.ordinal = targetDimension.ordinal;
      targetDimension.ordinal = tempOrdinal;
    }

    // swap positions in array
    dimensions.splice(index, 1);
    dimensions.splice(index - 1, 0, currentDimension);
    this.dimensionsCtl.setValue(dimensions);
    this.dimensionsCtl.markAsDirty();
    this.dimensionsCtl.updateValueAndValidity();

    this.updateFormulaFromDimensions();
  }

  public moveDimensionDown(index: number): void {
    if (index + 1 >= this.dimensionsCtl.value.length) {
      return;
    }
    this.closeDimension();
    const dimensions = [...this.dimensionsCtl.value];
    const currentDimension = dimensions[index];
    const targetDimension = dimensions[index + 1];

    // if both dimensions have ordinals (are formula-derived), swap their ordinals
    if (currentDimension.ordinal > 0 && targetDimension.ordinal > 0) {
      const tempOrdinal = currentDimension.ordinal;
      currentDimension.ordinal = targetDimension.ordinal;
      targetDimension.ordinal = tempOrdinal;
    }

    // swap positions in array
    dimensions.splice(index, 1);
    dimensions.splice(index + 1, 0, currentDimension);
    this.dimensionsCtl.setValue(dimensions);
    this.dimensionsCtl.markAsDirty();
    this.dimensionsCtl.updateValueAndValidity();

    this.updateFormulaFromDimensions();
  }

  public editOrdinal(index: number): void {
    this.editedOrdinalIndex = index;
    this.editedOrdinalValue = {
      value: this.dimensionsCtl.value[index]?.ordinal || 0,
      // max is the max ordinal value + 1
      max: Math.max(...this.dimensionsCtl.value.map((f) => f.ordinal || 0)) + 1,
      // warn values are all the distinct dimension ordinal values > 0
      // except the current one
      warnValues: Array.from(
        new Set(
          this.dimensionsCtl.value
            .map((f) => f.ordinal)
            .filter((o) => o > 0 && o !== this.editedOrdinalValue?.value)
        )
      ),
    };
  }

  public saveOrdinal(ordinal: CodOrdinalValue): void {
    if (this.editedOrdinalIndex < 0 || !this.editedOrdinalValue) {
      return;
    }

    const dimensions = [...this.dimensionsCtl.value];
    dimensions[this.editedOrdinalIndex].ordinal = ordinal.value;
    this.dimensionsCtl.setValue(dimensions);
    this.dimensionsCtl.markAsDirty();
    this.dimensionsCtl.updateValueAndValidity();

    this.closeOrdinal();
  }

  public closeOrdinal(): void {
    this.editedOrdinalIndex = -1;
    this.editedOrdinalValue = undefined;
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
    this._updatingForm = true;
    this.data.set(data);

    if (pristine) {
      this.form.markAsPristine();
    }
  }
}

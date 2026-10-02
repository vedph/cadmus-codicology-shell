import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  form,
  FormField,
  maxLength,
  required,
  validate,
} from '@angular/forms/signals';
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
  createLayoutFormulaService,
} from '@myrmidon/cod-layout-view';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodOrdinalEditorComponent,
  CodOrdinalValue,
} from '../cod-ordinal-editor/cod-ordinal-editor.component';

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

interface CodLayoutFormulaControls {
  formula: string;
  dimensions: OrderedPhysicalDimension[];
}

/**
 * Data -> draft. Each dimension gets its ordinal from the formula.
 */
function toDraft(
  data: CodLayoutFormulaWithDimensions | undefined,
): CodLayoutFormulaControls {
  const formula = data?.formula || '';
  const rawDimensions = data?.dimensions || [];
  const dimensions: OrderedPhysicalDimension[] = [];

  // if there are dimensions and a formula, we need to determine ordinals
  if (rawDimensions.length > 0 && formula) {
    const formulaService = createLayoutFormulaService(data?.prefix);
    // parse the current formula to determine which dimensions are formula-derived
    let parsedFormula: CodLayoutFormula | null | undefined = null;
    try {
      parsedFormula = formulaService.parseFormula(formula)?.result;
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
        formulaService.filterFormulaLabels(parsedFormula, allDimensionTags),
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
          if ((parsedFormula.height?.label || 'height') === d.tag) {
            ordinal = 1;
          } else if ((parsedFormula.width?.label || 'width') === d.tag) {
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

  return { formula, dimensions };
}

/**
 * Draft -> data. The dimensions' ordinals are an artifact of this
 * component, so they are not part of the data.
 */
function toData(
  draft: CodLayoutFormulaControls,
  prefix: CodLayoutFormulaWithDimensions['prefix'],
): CodLayoutFormulaWithDimensions {
  return {
    prefix,
    formula: draft.formula,
    dimensions: draft.dimensions.map(({ ordinal, ...dimension }) =>
      structuredClone(dimension),
    ),
  };
}

/**
 * True if a and b are the same data, ignoring the dimensions' ordinals:
 * they are an artifact of this component, and data bound from outside
 * may still carry them.
 */
function sameData(
  a: CodLayoutFormulaWithDimensions | undefined,
  b: CodLayoutFormulaWithDimensions | undefined,
): boolean {
  const strip = (d?: CodLayoutFormulaWithDimensions) =>
    d && {
      prefix: d.prefix,
      formula: d.formula,
      dimensions: (d.dimensions || []).map((x) => {
        const { ordinal, ...dimension } = x as OrderedPhysicalDimension;
        return dimension;
      }),
    };
  return JSON.stringify(strip(a)) === JSON.stringify(strip(b));
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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
  private readonly _dialogService = inject(DialogService);
  private _editedOrdinal = 0;

  // the currently edited dimension
  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<OrderedPhysicalDimension | undefined>(
    undefined,
  );

  // the currently edited ordinal value
  public readonly editedOrdinalIndex = signal<number>(-1);
  public readonly editedOrdinalValue = signal<CodOrdinalValue | undefined>(
    undefined,
  );

  /**
   * The data to edit.
   */
  public readonly data = model<CodLayoutFormulaWithDimensions>();

  // the formula service for the data's prefix
  private readonly _formulaService = computed(() =>
    createLayoutFormulaService(this.data()?.prefix),
  );

  /**
   * The hint for the current formula service.
   */
  public readonly hint = computed<string | undefined>(
    () => this._formulaService().hint,
  );

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

  /**
   * The editable draft, rebuilt from new data. The echo of our own save
   * keeps the draft instead, so that the dimensions keep the ordinals set
   * by the user rather than getting them again from the formula.
   */
  private readonly _draft = linkedSignal<
    CodLayoutFormulaWithDimensions | undefined,
    CodLayoutFormulaControls
  >({
    source: () => this.data(),
    computation: (data, previous) =>
      previous && sameData(data, toData(previous.value, data?.prefix))
        ? previous.value
        : toDraft(data),
  });

  public readonly form = form(this._draft, (p) => {
    required(p.formula);
    maxLength(p.formula, 500);
    validate(p.formula, ({ value }) => {
      // let required handle empty values
      if (!value()) {
        return null;
      }
      const errors = this._formulaService().validateFormula(value());
      return errors
        ? Object.keys(errors).map((k) => ({
            kind: 'formula',
            message: errors[k],
          }))
        : null;
    });
  });

  /**
   * The messages of the formula validation errors.
   */
  public readonly formulaErrors = computed<string[]>(() =>
    this.form
      .formula()
      .errors()
      .filter((e) => e.kind === 'formula')
      .map((e) => e.message || ''),
  );

  constructor() {
    // the draft mirrors the bound data again (e.g. new data): close the
    // editors and clear the interaction state
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (JSON.stringify(draft) === JSON.stringify(toDraft(this.data()))) {
          this.closeDimension();
          this.form().reset();
        }
      });
    });
  }

  private setDimensions(dimensions: OrderedPhysicalDimension[]): void {
    this.form.dimensions().value.set(dimensions);
    this.form.dimensions().markAsDirty();
  }

  public updateDimensionsFromFormula(): void {
    const formulaValue = this.form.formula().value();
    // if the formula is empty, do nothing
    if (!formulaValue) {
      return;
    }

    // parse the formula and get the spans
    let formula: CodLayoutFormula | null | undefined;
    try {
      formula = this._formulaService().parseFormula(formulaValue)?.result;
      if (!formula?.width || !formula?.height) {
        return;
      }
    } catch (error) {
      console.warn('Error parsing formula:', formulaValue, error);
      return;
    }

    // collect non-formula dimensions (those with ordinal 0)
    const nonFormulaDimensions = this.form
      .dimensions()
      .value()
      .filter((d) => !d.ordinal);

    // extract dimensions from formula height, width, and spans
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

    // update the dimensions with the new dimensions
    this.setDimensions(allDimensions);
  }

  public updateFormulaFromDimensions(): void {
    const dimensions = this.form.dimensions().value();
    // if there are no dimensions, do nothing
    if (!dimensions.length) {
      return;
    }

    // store the original formula for comparison
    const originalFormula = this.form.formula().value();

    // parse formula from its string value
    let parsedFormula: CodLayoutFormula | null | undefined;
    try {
      parsedFormula =
        this._formulaService().parseFormula(originalFormula)?.result;
      if (!parsedFormula) {
        console.warn('Failed to parse formula:', originalFormula);
        return;
      }
    } catch (error) {
      console.warn('Error parsing formula:', originalFormula);
      return;
    }

    // only work with formula-derived dimensions (ordinal > 0)
    const formulaDimensions = dimensions.filter((d) => d.ordinal > 0);
    if (formulaDimensions.length === 0) {
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
      }
    }

    // update width if it exists (ordinal 2)
    const widthDim = formulaDimensions.find((d) => d.ordinal === 2);
    if (parsedFormula.width?.label && widthDim) {
      if (widthDim.value !== parsedFormula.width.value) {
        parsedFormula.width.value = widthDim.value || 0;
        hasChanges = true;
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
      return;
    }

    // rebuild and update the formula value
    const newFormulaValue = this._formulaService().buildFormula(parsedFormula);

    if (newFormulaValue && newFormulaValue !== originalFormula) {
      // validate the new formula before applying it
      try {
        const reParseTest =
          this._formulaService().parseFormula(newFormulaValue);
        if (!reParseTest) {
          console.error('Rebuilt formula failed to parse, reverting');
          return;
        }
      } catch (error) {
        console.error('Error validating rebuilt formula:', error);
      }

      this.form.formula().value.set(newFormulaValue);
      this.form.formula().markAsDirty();
      this.form.formula().markAsTouched();
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
    this.editedIndex.set(index);
    this.edited.set(entry);
  }

  public closeDimension(): void {
    this._editedOrdinal = 0;
    this.editedIndex.set(-1);
    this.edited.set(undefined);

    this.closeOrdinal();
  }

  public saveDimension(dimension: PhysicalDimension): void {
    const dimensions = this.form.dimensions().value();
    const entries = [...dimensions];
    const dimensionWithOrdinal = { ...dimension, ordinal: this._editedOrdinal };
    let editedIndex = this.editedIndex();

    if (editedIndex === -1) {
      // adding a new dimension
      // check if a dimension with the same tag already exists and remove it
      const existingIndex = entries.findIndex(
        (d) => d.tag === dimension.tag && d.tag,
      );
      if (existingIndex !== -1) {
        entries.splice(existingIndex, 1);
      }
      entries.push(dimensionWithOrdinal);
    } else {
      // editing an existing dimension
      const originalDimension = dimensions[editedIndex];
      const originalTag = originalDimension?.tag;
      const newTag = dimension.tag;

      // if the tag changed, we need to handle potential duplicates
      if (originalTag !== newTag) {
        // remove any existing dimension with the new tag (to avoid duplicates)
        const duplicateIndex = entries.findIndex(
          (d, index) => d.tag === newTag && d.tag && index !== editedIndex,
        );
        if (duplicateIndex !== -1) {
          // if the duplicate is before our edited index, adjust the edited index
          if (duplicateIndex < editedIndex) {
            editedIndex--;
          }
          entries.splice(duplicateIndex, 1);
        }
      }

      // replace the dimension at the edited index
      entries.splice(editedIndex, 1, dimensionWithOrdinal);
    }

    this.setDimensions(entries);
    this.closeDimension();

    this.updateFormulaFromDimensions();
  }

  public deleteDimension(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete Dimension?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          this.closeOrdinal();
          if (this.editedIndex() === index) {
            this.closeDimension();
          }
          const dimensions = [...this.form.dimensions().value()];
          dimensions.splice(index, 1);
          this.setDimensions(dimensions);

          this.updateFormulaFromDimensions();
        }
      });
  }

  public moveDimensionUp(index: number): void {
    if (index < 1) {
      return;
    }
    this.closeDimension();
    const dimensions = [...this.form.dimensions().value()];
    const current = dimensions[index];
    const target = dimensions[index - 1];

    // if both dimensions have ordinals (are formula-derived), swap their ordinals
    let newCurrent: OrderedPhysicalDimension = current;
    let newTarget: OrderedPhysicalDimension = target;
    if (current.ordinal > 0 && target.ordinal > 0) {
      newCurrent = { ...current, ordinal: target.ordinal };
      newTarget = { ...target, ordinal: current.ordinal };
    }

    // swap positions in array
    dimensions.splice(index - 1, 2, newCurrent, newTarget);
    this.setDimensions(dimensions);

    this.updateFormulaFromDimensions();
  }

  public moveDimensionDown(index: number): void {
    if (index + 1 >= this.form.dimensions().value().length) {
      return;
    }
    this.closeDimension();
    const dimensions = [...this.form.dimensions().value()];
    const current = dimensions[index];
    const target = dimensions[index + 1];

    // if both dimensions have ordinals (are formula-derived), swap their ordinals
    let newCurrent: OrderedPhysicalDimension = current;
    let newTarget: OrderedPhysicalDimension = target;
    if (current.ordinal > 0 && target.ordinal > 0) {
      newCurrent = { ...current, ordinal: target.ordinal };
      newTarget = { ...target, ordinal: current.ordinal };
    }

    // swap positions in array
    dimensions.splice(index, 2, newTarget, newCurrent);
    this.setDimensions(dimensions);

    this.updateFormulaFromDimensions();
  }

  public editOrdinal(index: number): void {
    const dimensions = this.form.dimensions().value();
    const value = dimensions[index]?.ordinal || 0;
    this.editedOrdinalIndex.set(index);
    this.editedOrdinalValue.set({
      value,
      // max is the max ordinal value + 1
      max: Math.max(...dimensions.map((f) => f.ordinal || 0)) + 1,
      // warn values are all the distinct dimension ordinal values > 0
      // except the current one
      warnValues: Array.from(
        new Set(
          dimensions.map((f) => f.ordinal).filter((o) => o > 0 && o !== value),
        ),
      ),
    });
  }

  public saveOrdinal(ordinal: CodOrdinalValue): void {
    const index = this.editedOrdinalIndex();
    if (index < 0 || !this.editedOrdinalValue()) {
      return;
    }

    const dimensions = [...this.form.dimensions().value()];
    dimensions[index] = {
      ...dimensions[index],
      ordinal: ordinal.value,
    };
    this.setDimensions(dimensions);

    this.closeOrdinal();
  }

  public closeOrdinal(): void {
    this.editedOrdinalIndex.set(-1);
    this.editedOrdinalValue.set(undefined);
  }

  public cancel(): void {
    this.cancelEdit.emit();
  }

  public save(pristine = true): void {
    if (this.form().invalid()) {
      // show validation errors
      this.form().markAsTouched();
      return;
    }

    this.data.set(toData(this._draft(), this.data()?.prefix));

    if (pristine) {
      this.form().reset();
    }
  }
}

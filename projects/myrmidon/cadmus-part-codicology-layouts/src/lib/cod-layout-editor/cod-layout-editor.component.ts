import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import {
  DecoratedCount,
  DecoratedCountsComponent,
} from '@myrmidon/cadmus-refs-decorated-counts';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CodLayoutFormulaComponent,
  CodLayoutFormulaWithDimensions,
} from '@myrmidon/cadmus-codicology-ui';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { CodLayout } from '../cod-layouts-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-layout-editor',
  templateUrl: './cod-layout-editor.component.html',
  styleUrls: ['./cod-layout-editor.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    CodLocationComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
    DecoratedCountsComponent,
    MatSlideToggleModule,
    FlagSetComponent,
    CodLayoutFormulaComponent,
  ],
})
export class CodLayoutEditorComponent {
  public readonly layout = model<CodLayout>();

  // cod-layout-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // cod-layout-ruling-techniques
  public rulTechEntries = input<ThesaurusEntry[]>();
  // cod-layout-derolez
  public drzEntries = input<ThesaurusEntry[]>();
  // cod-layout-prickings
  public prkEntries = input<ThesaurusEntry[]>();
  // decorated-count-ids
  public cntIdEntries = input<ThesaurusEntry[]>();
  // decorated-count-tags
  public cntTagEntries = input<ThesaurusEntry[]>();

  public editorClose = output();

  public readonly rulFlags = computed<Flag[]>(
    () => this.rulTechEntries()?.map(entryToFlag) || []
  );

  public readonly formulaWithDimensions =
    signal<CodLayoutFormulaWithDimensions | null>(null);

  public sampleRanges: FormControl<CodLocationRange[]>;
  public ranges: FormControl<CodLocationRange[]>;
  public rulings: FormControl<string[]>;
  public derolez: FormControl<string | null>;
  public pricking: FormControl<string | null>;
  public columnCount: FormControl<number>;
  public counts: FormControl<DecoratedCount[]>;
  public tag: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.sampleRanges = formBuilder.control([], {
      nonNullable: true,
    });
    this.ranges = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.rulings = formBuilder.control([], { nonNullable: true });
    this.derolez = formBuilder.control(null, Validators.maxLength(50));
    this.pricking = formBuilder.control(null, Validators.maxLength(50));
    this.columnCount = formBuilder.control(0, { nonNullable: true });
    this.counts = formBuilder.control([], { nonNullable: true });
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      sampleRanges: this.sampleRanges,
      ranges: this.ranges,
      rulings: this.rulings,
      derolez: this.derolez,
      pricking: this.pricking,
      columnCount: this.columnCount,
      counts: this.counts,
      tag: this.tag,
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.layout());
    });
  }

  private updateForm(layout: CodLayout | undefined): void {
    if (!layout) {
      this.form.reset();
      this.formulaWithDimensions.set(null);
      return;
    }

    this.sampleRanges.setValue(
      layout.sample ? [{ start: layout.sample, end: layout.sample }] : []
    );
    this.ranges.setValue(layout.ranges || []);
    this.rulings.setValue(layout.rulingTechniques || []);
    this.derolez.setValue(layout.derolez || null);
    this.pricking.setValue(layout.pricking || null);
    this.columnCount.setValue(layout.columnCount);
    this.counts.setValue(layout.counts || []);
    this.tag.setValue(layout.tag || null);
    this.note.setValue(layout.note || null);

    this.formulaWithDimensions.set({
      formula: layout.formula || '',
      dimensions: layout.dimensions || [],
    });

    this.form.markAsPristine();
  }

  public onFormulaChange(data: CodLayoutFormulaWithDimensions): void {
    // remove ordinal property from dimensions if present
    const cleanedData = {
      ...data,
      dimensions:
        data.dimensions?.map((dimension) => {
          const { ordinal, ...cleanDimension } = dimension as any;
          return cleanDimension;
        }) || [],
    };

    this.formulaWithDimensions.set(cleanedData);
  }

  private getLayout(): CodLayout {
    const formulaWithDimensions = this.formulaWithDimensions();
    return {
      sample: this.sampleRanges.value[0]?.start,
      ranges: this.ranges.value || [],
      formula: formulaWithDimensions?.formula || undefined,
      dimensions: formulaWithDimensions?.dimensions || undefined,
      rulingTechniques: this.rulings.value?.length
        ? this.rulings.value
        : undefined,
      derolez: this.derolez.value?.trim(),
      pricking: this.pricking.value?.trim(),
      columnCount: this.columnCount.value || 0,
      counts: this.counts.value?.length ? this.counts.value : undefined,
      tag: this.tag.value?.trim(),
      note: this.note.value?.trim(),
    };
  }

  public onSampleLocationChange(ranges: CodLocationRange[] | null): void {
    this.sampleRanges.setValue(ranges || []);
    this.sampleRanges.updateValueAndValidity();
    this.sampleRanges.markAsDirty();
  }

  public onRangeLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onCountsChange(counts: DecoratedCount[]): void {
    this.counts.setValue(counts);
    this.counts.updateValueAndValidity();
    this.counts.markAsDirty();
  }

  public onCheckedIdsChange(ids: string[]): void {
    this.rulings.setValue(ids);
    this.rulings.updateValueAndValidity();
    this.rulings.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.layout.set(this.getLayout());
  }
}

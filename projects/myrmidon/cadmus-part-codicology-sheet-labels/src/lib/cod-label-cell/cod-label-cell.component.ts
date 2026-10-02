import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import { form, FormField, maxLength } from '@angular/forms/signals';

import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';

import { Flag, FlagSetBadgeComponent } from '@myrmidon/cadmus-ui-flag-set';
import { ColorToContrastPipe } from '@myrmidon/ngx-tools';

import { CodLabelCell } from '../label-generator';
import { CellFeaturesComponent } from '../cell-features/cell-features.component';

interface CodLabelCellControls {
  value: string;
  note: string;
  features: string[];
}

function toDraft(cell?: CodLabelCell): CodLabelCellControls {
  return {
    value: cell?.value || '',
    note: cell?.note || '',
    features: [...(cell?.features || [])],
  };
}

/**
 * Draft -> cell. The row and cell IDs come from the bound cell.
 */
function toCell(
  draft: CodLabelCellControls,
  cell: CodLabelCell | undefined,
): CodLabelCell {
  return {
    rowId: cell!.rowId,
    id: cell!.id,
    value: draft.value.trim() || undefined,
    features: draft.features.length ? [...draft.features] : undefined,
    note: draft.note.trim() || undefined,
  };
}

@Component({
  selector: 'cadmus-cod-label-cell',
  templateUrl: './cod-label-cell.component.html',
  styleUrls: ['./cod-label-cell.component.css'],
  imports: [
    MatTooltip,
    MatIcon,
    MatIconButton,
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    FlagSetBadgeComponent,
    ColorToContrastPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodLabelCellComponent {
  public readonly dialog = inject(MatDialog);

  /**
   * The cell to display and edit.
   */
  public readonly cell = model<CodLabelCell>();

  /**
   * The color to use for the cell.
   */
  public readonly color = input<string>();

  /**
   * The list of feature flags available for this cell.
   */
  public readonly featureFlags = input<Flag[]>([]);

  @ViewChild('valueInput')
  public valueElement?: ElementRef;
  @ViewChild('noteInput')
  public noteElement?: ElementRef;

  public readonly editMode = signal<'none' | 'value' | 'note'>('none');

  /**
   * The editable draft. The echo of our own save keeps the draft, rather
   * than rebuilding it from the (normalized) saved cell.
   */
  private readonly _draft = linkedSignal<
    CodLabelCell | undefined,
    CodLabelCellControls
  >({
    source: () => this.cell(),
    computation: (cell, previous) =>
      previous &&
      cell &&
      JSON.stringify(cell) === JSON.stringify(toCell(previous.value, cell))
        ? previous.value
        : toDraft(cell),
  });

  public readonly form = form(this._draft, (p) => {
    maxLength(p.value, 50);
    maxLength(p.note, 500);
  });

  /**
   * The list of feature flags set for the current cell.
   */
  public readonly cellFlags = computed<Flag[]>(() =>
    this.form
      .features()
      .value()
      .map((f) => this.featureFlags().find((ff) => ff.id === f)!),
  );

  constructor() {
    // the draft mirrors the bound cell again: clear interaction state
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (JSON.stringify(draft) === JSON.stringify(toDraft(this.cell()))) {
          this.form().reset();
        }
      });
    });
  }

  public editValue(): void {
    if (this.editMode() !== 'none') {
      return;
    }
    this.editMode.set('value');
    this.form.features().value.set([...(this.cell()?.features || [])]);
    setTimeout(() => {
      this.valueElement?.nativeElement.focus();
      this.valueElement?.nativeElement.select();
    }, 500);
  }

  public editNote(): void {
    if (this.editMode() !== 'none') {
      return;
    }
    this.editMode.set('note');
    setTimeout(() => {
      this.noteElement?.nativeElement.focus();
      this.noteElement?.nativeElement.select();
    }, 500);
  }

  public editFeatures(): void {
    if (!this.featureFlags().length) {
      return;
    }

    const dialogRef = this.dialog.open(CellFeaturesComponent, {
      height: '300px',
      width: '400px',
      data: {
        flags: this.featureFlags(),
        checkedIds: this.form.features().value(),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.form.features().value.set(result);
        this.form.features().markAsDirty();
        // save changes to cell
        this.cell.set(toCell(this._draft(), this.cell()));
      }
    });
  }

  /**
   * Save the edit when the user presses Enter in its input, unless invalid.
   */
  public onEnterKey(event: Event): void {
    event.preventDefault();
    this.saveEdit();
  }

  public saveEdit(): void {
    if (this.form().invalid()) {
      return;
    }
    this.editMode.set('none');
    const cell = toCell(this._draft(), this.cell());
    this.cell.set(cell);
    // edit again from the saved (normalized) cell
    this._draft.set(toDraft(cell));
  }

  public cancelEdit(): void {
    this._draft.set(toDraft(this.cell()));
    this.editMode.set('none');
  }
}

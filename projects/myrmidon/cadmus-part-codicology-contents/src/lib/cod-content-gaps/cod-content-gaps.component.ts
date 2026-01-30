import { CommonModule } from '@angular/common';
import { Component, input, linkedSignal, model, signal } from '@angular/core';

// material
import { MatButtonModule } from '@angular/material/button';
import {
  MatExpansionModule,
} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// myrmidon
import { FlatLookupPipe } from '@myrmidon/ngx-tools';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import { LookupDocReferenceComponent } from '@myrmidon/cadmus-refs-lookup';

// local
import { CodContentGap } from '../cod-contents-part';

@Component({
  selector: 'cadmus-cod-content-gaps',
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    LookupDocReferenceComponent,
    FlatLookupPipe,
  ],
  templateUrl: './cod-content-gaps.component.html',
  styleUrl: './cod-content-gaps.component.css',
})
export class CodContentGapsComponent {
  /**
   * The gaps edited by this component.
   */
  public readonly gaps = model<CodContentGap[]>();

  // cod-content-gap-types
  public readonly gapTypeEntries = input<ThesaurusEntry[]>();
  // cod-content-gap-tags
  public readonly gapTagEntries = input<ThesaurusEntry[]>();

  // Editable copy of gaps that auto-syncs when gaps changes
  public readonly editedGaps = linkedSignal(() => [...(this.gaps() ?? [])]);

  // Currently edited gap index (-1 = none, -2 = adding new)
  public readonly editingIndex = signal<number>(-1);

  // The gap being edited (start/end references)
  public readonly editedStart = signal<DocReference>({ citation: '' });
  public readonly editedEnd = signal<DocReference>({ citation: '' });

  // Which reference is being edited in the single editor ('start' | 'end' | null)
  public readonly editingRef = signal<'start' | 'end' | null>(null);

  // The reference currently shown in the single editor
  public readonly currentEditedRef = signal<DocReference>({ citation: '' });

  /**
   * Emit changes to the parent component.
   */
  private emitGapsChange(): void {
    this.gaps.set(this.editedGaps());
  }

  /**
   * Add a new gap.
   */
  public addGap(): void {
    this.editedStart.set({ citation: '' });
    this.editedEnd.set({ citation: '' });
    this.editingIndex.set(-2); // -2 indicates adding new
  }

  /**
   * Edit an existing gap at the specified index.
   */
  public editGap(index: number): void {
    const gaps = this.editedGaps();
    if (index < 0 || index >= gaps.length) {
      return;
    }
    const gap = gaps[index];
    this.editedStart.set({ ...gap.start });
    this.editedEnd.set({ ...gap.end });
    this.editingIndex.set(index);
  }

  /**
   * Remove a gap at the specified index.
   */
  public removeGap(index: number): void {
    this.editedGaps.update((g) => g.filter((_, i) => i !== index));
    // If we were editing this gap, cancel the edit
    if (this.editingIndex() === index) {
      this.cancelEdit();
    } else if (this.editingIndex() > index) {
      // Adjust editing index if needed
      this.editingIndex.update((i) => i - 1);
    }
    this.emitGapsChange();
  }

  /**
   * Move a gap up in the list.
   */
  public moveGapUp(index: number): void {
    if (index <= 0) {
      return;
    }
    this.editedGaps.update((g) => {
      const copy = [...g];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
    // Adjust editing index if needed
    if (this.editingIndex() === index) {
      this.editingIndex.set(index - 1);
    } else if (this.editingIndex() === index - 1) {
      this.editingIndex.set(index);
    }
    this.emitGapsChange();
  }

  /**
   * Move a gap down in the list.
   */
  public moveGapDown(index: number): void {
    const gaps = this.editedGaps();
    if (index >= gaps.length - 1) {
      return;
    }
    this.editedGaps.update((g) => {
      const copy = [...g];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
    // Adjust editing index if needed
    if (this.editingIndex() === index) {
      this.editingIndex.set(index + 1);
    } else if (this.editingIndex() === index + 1) {
      this.editingIndex.set(index);
    }
    this.emitGapsChange();
  }

  /**
   * Start editing a reference (start or end).
   */
  public editRef(which: 'start' | 'end'): void {
    const ref = which === 'start' ? this.editedStart() : this.editedEnd();
    this.currentEditedRef.set({ ...ref });
    this.editingRef.set(which);
  }

  /**
   * Handle reference change from the single editor.
   * This is called when the LookupDocReferenceComponent emits a change.
   */
  public onRefChange(ref: DocReference | undefined): void {
    if (!ref) {
      // User cancelled - just close the editor
      this.editingRef.set(null);
      return;
    }

    const which = this.editingRef();
    if (which === 'start') {
      this.editedStart.set(ref);
    } else if (which === 'end') {
      this.editedEnd.set(ref);
    }
    this.editingRef.set(null);
  }

  /**
   * Save the currently edited gap.
   */
  public saveGap(): void {
    const start = this.editedStart();
    const end = this.editedEnd();

    // Validate: both start and end must have citations
    if (!start.citation?.trim() || !end.citation?.trim()) {
      return;
    }

    const gap: CodContentGap = { start, end };
    const index = this.editingIndex();

    if (index === -2) {
      // Adding new gap
      this.editedGaps.update((g) => [...g, gap]);
    } else if (index >= 0) {
      // Updating existing gap
      this.editedGaps.update((g) => {
        const copy = [...g];
        copy[index] = gap;
        return copy;
      });
    }

    this.editingIndex.set(-1);
    this.emitGapsChange();
  }

  /**
   * Cancel the current edit operation.
   */
  public cancelEdit(): void {
    this.editingIndex.set(-1);
    this.editingRef.set(null);
  }

  /**
   * Check if the current edit is valid (both citations are non-empty).
   */
  public isEditValid(): boolean {
    return (
      !!this.editedStart().citation?.trim() &&
      !!this.editedEnd().citation?.trim()
    );
  }

  /**
   * Commit all changes to the parent component.
   */
  public commit(): void {
    this.gaps.set(this.editedGaps());
  }

  /**
   * Discard all changes and reset to original gaps.
   */
  public discard(): void {
    this.editedGaps.set([...(this.gaps() ?? [])]);
    this.editingIndex.set(-1);
  }
}

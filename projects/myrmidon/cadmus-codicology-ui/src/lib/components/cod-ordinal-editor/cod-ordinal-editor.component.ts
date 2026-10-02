import {
  ChangeDetectionStrategy,
  Component,
  effect,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { form, FormField, max, min } from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CodOrdinalValue {
  value: number;
  min?: number;
  max?: number;
  warnValues?: number[];
}

interface CodOrdinalControls {
  value: number | null;
}

function toDraft(ordinal?: CodOrdinalValue | null): CodOrdinalControls {
  return { value: ordinal?.value ?? 0 };
}

@Component({
  selector: 'cadmus-cod-ordinal-editor',
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './cod-ordinal-editor.component.html',
  styleUrls: ['./cod-ordinal-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodOrdinalEditorComponent {
  public readonly ordinal = model<CodOrdinalValue>();
  public readonly cancelEdit = output();

  private readonly _draft = linkedSignal(() => toDraft(this.ordinal()));

  public readonly form = form(this._draft, (p) => {
    // optional range from the bound ordinal
    min(p.value, () => this.ordinal()?.min);
    max(p.value, () => this.ordinal()?.max);
  });

  constructor() {
    // the draft mirrors the bound ordinal again: clear interaction state
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (draft.value === toDraft(this.ordinal()).value) {
          this.form().reset();
        }
      });
    });
  }

  public cancel(): void {
    this.cancelEdit.emit();
  }

  /**
   * Save the edited value when the user presses Enter in its input, like
   * the implicit submission of a form would: only when the save button is
   * enabled.
   */
  public onEnterKey(event: Event): void {
    event.preventDefault();
    if (this.form().invalid() || !this.form().dirty()) {
      return;
    }
    this.save();
  }

  /**
   * Saves the current form data by updating the `ordinal` model signal.
   * @param pristine If true (default), the form's interaction state is
   * cleared after saving.
   */
  public save(pristine = true): void {
    if (this.form().invalid()) {
      // show validation errors
      this.form().markAsTouched();
      return;
    }

    this.ordinal.set({
      ...this.ordinal(),
      value: this._draft().value ?? 0,
    });

    if (pristine) {
      this.form().reset();
    }
  }
}

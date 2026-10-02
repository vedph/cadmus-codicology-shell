import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  linkedSignal,
  model,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { form, FormField, validate } from '@angular/forms/signals';
import { debounceTime } from 'rxjs/operators';

import { MatFormField, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

/**
 * The prefix added to a free text when emitting the idChange event.
 */
const FREE_PREFIX = '$';

interface TextOrEntryControls {
  id: string;
}

function toDraft(id: string | undefined): TextOrEntryControls {
  return { id: id || '' };
}

function toId(draft: TextOrEntryControls, free: boolean): string {
  return free && !draft.id.startsWith(FREE_PREFIX)
    ? FREE_PREFIX + draft.id
    : draft.id;
}

@Component({
  selector: 'cadmus-text-or-entry-selector',
  templateUrl: './text-or-entry-selector.component.html',
  styleUrls: ['./text-or-entry-selector.component.css'],
  imports: [FormField, MatFormField, MatSelect, MatOption, MatError, MatInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextOrEntrySelectorComponent {
  /**
   * The label for the entry.
   */
  public readonly label = input<string>('entry');

  /**
   * The ID, selected or entered.
   */
  public readonly id = model<string>();

  /**
   * The validators for the text or entry (e.g. `Validators.required`,
   * `Validators.maxLength(n)`, `Validators.pattern(p)`). They are applied
   * to the entered value: each error they return is shown by its key.
   */
  public readonly validators = input<ValidatorFn[]>();

  /**
   * True for unbound text entry; false for entry selection.
   */
  public readonly free = input<boolean>(false);

  /**
   * The entries to pick from, if any.
   */
  public readonly entries = input<ThesaurusEntry[]>();

  /**
   * The editable draft. The echo of our own emission (possibly prefixed)
   * keeps the draft, which holds what the user entered.
   */
  private readonly _draft = linkedSignal<string | undefined, TextOrEntryControls>(
    {
      source: () => this.id(),
      computation: (id, previous) =>
        previous && id === toId(previous.value, untracked(this.free))
          ? previous.value
          : toDraft(id),
    },
  );

  public readonly form = form(this._draft, (p) => {
    validate(p.id, ({ value }) => {
      const control = { value: value() } as AbstractControl;
      const errors = (this.validators() || [])
        .map((fn) => fn(control))
        .filter((e) => !!e)
        .flatMap((e) => Object.keys(e!).map((kind) => ({ kind })));
      return errors.length ? errors : null;
    });
  });

  constructor() {
    // the draft mirrors the bound ID again: clear interaction state
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });

    // emit edits, once the draft has diverged from the bound ID
    toObservable(this._draft)
      .pipe(debounceTime(200), takeUntilDestroyed())
      .subscribe((draft) => {
        if (!this.isDraftInSync(draft)) {
          this.id.set(toId(draft, this.free()));
        }
      });
  }

  private isDraftInSync(draft: TextOrEntryControls): boolean {
    return draft.id === toDraft(this.id()).id;
  }
}

import {
  Component,
  effect,
  input,
  model,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MatFormField, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Subscription } from 'rxjs';

/**
 * The prefix added to a free text when emitting the idChange event.
 */
const FREE_PREFIX = '$';

@Component({
  selector: 'cadmus-text-or-entry-selector',
  templateUrl: './text-or-entry-selector.component.html',
  styleUrls: ['./text-or-entry-selector.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
  ],
})
export class TextOrEntrySelectorComponent implements OnInit, OnDestroy {
  private _sub?: Subscription;
  private _id: string | undefined;
  private _dropNextInput?: boolean;

  public idCtl: FormControl<string | null>;
  public form: FormGroup;

  /**
   * The label for the entry.
   */
  public readonly label = input<string>('entry');

  /**
   * The ID, selected or entered.
   */
  public readonly id = model<string>();

  /**
   * The validators for the text or entry (required, maxLength,
   * pattern).
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

  constructor(formBuilder: FormBuilder) {
    // form
    this.idCtl = formBuilder.control(null);
    this.form = formBuilder.group({
      id: this.idCtl,
    });

    effect(() => {
      if (this._dropNextInput) {
        this._dropNextInput = false;
        return;
      }
      const id = this.id();
      this.idCtl.setValue(id || null);
      this.idCtl.markAsPristine();
    });

    effect(() => {
      this.idCtl.setValidators(this.validators() || []);
    });
  }

  private emitIdChange(): void {
    this._dropNextInput = true;
    this.id.set(
      this.free() && !this.idCtl.value?.startsWith(FREE_PREFIX)
        ? FREE_PREFIX + this.idCtl.value
        : this.idCtl.value!,
    );
  }

  public ngOnInit(): void {
    this._sub = this.idCtl.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(200))
      .subscribe((_) => {
        this.emitIdChange();
      });
    if (this._id) {
      this.emitIdChange();
    }
  }

  public ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }
}

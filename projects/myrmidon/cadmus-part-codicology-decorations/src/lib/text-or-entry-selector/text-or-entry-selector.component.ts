import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * The prefix added to a free text when emitting the idChange event.
 */
const FREE_PREFIX = '$';

@Component({
  selector: 'cadmus-text-or-entry-selector',
  templateUrl: './text-or-entry-selector.component.html',
  styleUrls: ['./text-or-entry-selector.component.css'],
})
export class TextOrEntrySelectorComponent implements OnInit {
  private _validators: ValidatorFn[] | undefined;
  private _id: string | undefined;
  private _free: boolean;

  public idCtl: FormControl<string|null>;
  public form: FormGroup;

  /**
   * The label for the entry.
   */
  @Input()
  public label: string;

  /**
   * The ID, selected or entered.
   */
  @Input()
  public get id(): string | undefined {
    return this._id;
  }
  public set id(value: string | undefined) {
    if (this._id === value) {
      return;
    }
    this._id = value;
    this.idCtl.setValue(value || null);
    this.idCtl.markAsPristine();
  }

  /**
   * The validators for the text or entry (required, maxLength,
   * pattern).
   */
  @Input()
  public get validators(): ValidatorFn[] | undefined {
    return this._validators;
  }
  public set validators(value: ValidatorFn[] | undefined) {
    if (this._validators === value) {
      return;
    }
    this._validators = value;
    this.idCtl.setValidators(value || []);
  }

  /**
   * True for unbound text entry; false for entry selection.
   */
  @Input()
  public get free(): boolean {
    return this._free;
  }
  public set free(value: boolean) {
    if (this._free === value) {
      return;
    }
    this._free = value;
    this.idCtl.reset();
  }

  /**
   * The entries to pick from, if any.
   */
  @Input()
  public entries: ThesaurusEntry[] | undefined;

  /**
   * Emitted whenever the edited ID changes.
   * If this is a free entry, it is prefixed with $.
   */
  @Output()
  public idChange: EventEmitter<string>;

  constructor(formBuilder: FormBuilder) {
    this.label = 'entry';
    this._free = false;
    this.idChange = new EventEmitter<string>();
    // form
    this.idCtl = formBuilder.control(null);
    this.form = formBuilder.group({
      id: this.idCtl,
    });
  }

  private emitIdChange(): void {
    this.idChange.emit(
      this._free && !this.idCtl.value?.startsWith(FREE_PREFIX)
        ? FREE_PREFIX + this.idCtl.value
        : this.idCtl.value!
    );
  }

  ngOnInit(): void {
    this.idCtl.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(200))
      .subscribe((_) => {
        this.emitIdChange();
      });
    if (this._id) {
      this.emitIdChange();
    }
  }
}

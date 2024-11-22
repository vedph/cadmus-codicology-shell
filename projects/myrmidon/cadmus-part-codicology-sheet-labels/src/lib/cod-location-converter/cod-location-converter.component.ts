import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { debounceTime, distinctUntilChanged, Observable, take } from 'rxjs';

import { ItemService } from '@myrmidon/cadmus-api';
import { ItemRefLookupService } from '@myrmidon/cadmus-codicology-ui';
import { Item } from '@myrmidon/cadmus-core';

import { CodLocationConverter } from '../cod-location-converter';
import {
  CodSheetLabelsPart,
  COD_SHEET_LABELS_PART_TYPEID,
} from '../cod-sheet-labels-part';
import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Codicological location converter component.
 */
@Component({
  selector: 'cadmus-cod-location-converter',
  templateUrl: './cod-location-converter.component.html',
  styleUrls: ['./cod-location-converter.component.css'],
  standalone: false,
})
export class CodLocationConverterComponent implements OnInit {
  private readonly _converter: CodLocationConverter;
  private _item: Item | undefined | null;
  private _facetId: string | undefined;
  private _locFrozen?: boolean;
  private _labFrozen?: boolean;

  public loading?: boolean;
  public baseFilter?: any;

  public system: FormControl<string | null>;
  public autoCopy: FormControl<boolean>;
  public location: FormControl<string | null>;
  public label: FormControl<string | null>;
  public form: FormGroup;
  public systems$: Observable<string[]>;
  public user$: Observable<User | null>;

  /**
   * The current item.
   */
  @Input()
  public get item(): Item | undefined | null {
    return this._item;
  }
  public set item(value: Item | undefined | null) {
    if (this._item === value) {
      return;
    }
    this._item = value;
  }

  /**
   * The facet ID for filtering items during lookup.
   */
  @Input()
  public get facetId(): string | undefined {
    return this._facetId;
  }
  public set facetId(value: string | undefined) {
    if (this._facetId === value) {
      return;
    }
    this._facetId = value;
    this.baseFilter = value ? { facetId: value } : undefined;
  }

  constructor(
    public lookupService: ItemRefLookupService,
    private _itemService: ItemService,
    authService: AuthJwtService,
    private _clipboard: Clipboard,
    private _snackbar: MatSnackBar,
    formBuilder: FormBuilder
  ) {
    this._converter = new CodLocationConverter();
    this.systems$ = this._converter.systems$;
    this.user$ = authService.currentUser$;
    // form
    this.system = formBuilder.control(null, Validators.required);
    this.autoCopy = formBuilder.control(false, { nonNullable: true });
    this.location = formBuilder.control(null);
    this.label = formBuilder.control(null);
    this.form = formBuilder.group({
      system: this.system,
      autoCopy: this.autoCopy,
      location: this.location,
      label: this.label,
    });
  }

  ngOnInit(): void {
    // auto convert from label
    this.label.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe((value) => {
        if (this.system.value && !this._labFrozen) {
          this._locFrozen = true;
          const result = this._converter.getLocation(this.system.value, value!);
          console.log(result);
          if (this.autoCopy.value && result) {
            this._clipboard.copy(result);
            this._snackbar.open('Copied ' + result, 'OK', {
              duration: 1000,
            });
          }
          this.location.setValue(result, { emitEvent: false });
          this._locFrozen = false;
        }
      });

    // auto convert from location
    this.location.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe((value) => {
        if (this.system.value && !this._locFrozen) {
          this._labFrozen = true;
          const result = this._converter.getLabel(this.system.value, value!);
          console.log(result);
          if (this.autoCopy.value && result) {
            this._clipboard.copy(result);
            this._snackbar.open('Copied ' + result, 'OK', {
              duration: 1000,
            });
          }
          this.label.setValue(result, { emitEvent: false });
          this._labFrozen = false;
        }
      });
  }

  public onItemChange(item: Item): void {
    this.item = item;
    this.updateForm();
  }

  private resetForm(): void {
    this._converter.setRows([]);
    this.form.reset();
  }

  private updateForm(): void {
    if (!this._item) {
      this.resetForm();
      return;
    }
    this.loading = true;
    this._itemService
      .getPartFromTypeAndRole(this._item.id, COD_SHEET_LABELS_PART_TYPEID)
      .pipe(take(1))
      .subscribe({
        next: (part) => {
          this.form.reset();
          const p = part as CodSheetLabelsPart;
          if (!p) {
            this.resetForm();
            return;
          }
          this._converter.setRows(p.rows);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading labels part for item ' + this._item!.id);
          if (error) {
            console.error(JSON.stringify(error));
          }
        },
      });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  OnInit,
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
import { AsyncPipe } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { debounceTime, distinctUntilChanged, Observable, take } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { RefLookupComponent } from '@myrmidon/cadmus-refs-lookup';

import { Item } from '@myrmidon/cadmus-core';
import { ItemService } from '@myrmidon/cadmus-api';
import { ItemRefLookupService } from '@myrmidon/cadmus-codicology-ui';

import {
  CodSheetLabelsPart,
  COD_SHEET_LABELS_PART_TYPEID,
} from '../cod-sheet-labels-part';
import { CodLocationConverter } from '../cod-location-converter';

/**
 * Codicological location converter component.
 */
@Component({
  selector: 'cadmus-cod-location-converter',
  templateUrl: './cod-location-converter.component.html',
  styleUrls: ['./cod-location-converter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatProgressBar,
    RefLookupComponent,
    MatSlideToggle,
    MatTooltip,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    MatIcon,
    AsyncPipe,
  ],
})
export class CodLocationConverterComponent implements OnInit {
  private readonly _converter: CodLocationConverter;
  private _locFrozen?: boolean;
  private _labFrozen?: boolean;

  public readonly loading = signal<boolean>(false);
  public readonly baseFilter = signal<any>(undefined);

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
  public readonly item = model<Item>();

  /**
   * The facet ID for filtering items during lookup.
   */
  public readonly facetId = input<string>();

  constructor(
    public lookupService: ItemRefLookupService,
    private _itemService: ItemService,
    authService: AuthJwtService,
    private _clipboard: Clipboard,
    private _snackbar: MatSnackBar,
    formBuilder: FormBuilder,
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

    effect(() => {
      this.updateForm(this.item());
    });

    effect(() => {
      this.baseFilter.set(
        this.facetId() ? { facetId: this.facetId() } : undefined,
      );
    });
  }

  public ngOnInit(): void {
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

  public onItemChange(item: unknown): void {
    this.item.set(item as Item);
  }

  private resetForm(): void {
    this._converter.setRows([]);
    this.form.reset();
  }

  private updateForm(item?: Item): void {
    if (!item) {
      this.resetForm();
      return;
    }
    this.loading.set(true);
    this._itemService
      .getPartFromTypeAndRole(item.id, COD_SHEET_LABELS_PART_TYPEID)
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
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          console.error(
            'Error loading labels part for item ' + item!.id,
            error,
          );
        },
      });
  }
}

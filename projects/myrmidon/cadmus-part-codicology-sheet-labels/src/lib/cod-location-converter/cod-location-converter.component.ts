import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, FormField, required } from '@angular/forms/signals';
import { AsyncPipe } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { debounceTime, Observable, Subject, take } from 'rxjs';

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

interface CodLocationConverterControls {
  system: string | null;
  autoCopy: boolean;
  location: string;
  label: string;
}

function makeDefaultDraft(): CodLocationConverterControls {
  return { system: null, autoCopy: false, location: '', label: '' };
}

/**
 * Codicological location converter component.
 */
@Component({
  selector: 'cadmus-cod-location-converter',
  templateUrl: './cod-location-converter.component.html',
  styleUrls: ['./cod-location-converter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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
export class CodLocationConverterComponent {
  private readonly _itemService = inject(ItemService);
  private readonly _clipboard = inject(Clipboard);
  private readonly _snackbar = inject(MatSnackBar);
  private readonly _converter = new CodLocationConverter();
  // the user's input in the label and location fields
  private readonly _labelInput = new Subject<void>();
  private readonly _locationInput = new Subject<void>();

  public readonly lookupService = inject(ItemRefLookupService);
  public readonly loading = signal<boolean>(false);

  public readonly systems$: Observable<string[]> = this._converter.systems$;
  public readonly user$: Observable<User | null> =
    inject(AuthJwtService).currentUser$;

  /**
   * The current item.
   */
  public readonly item = model<Item>();

  /**
   * The facet ID for filtering items during lookup.
   */
  public readonly facetId = input<string>();

  public readonly baseFilter = computed<any>(() =>
    this.facetId() ? { facetId: this.facetId() } : undefined,
  );

  private readonly _draft = signal<CodLocationConverterControls>(
    makeDefaultDraft(),
  );
  public readonly form = form(this._draft, (p) => {
    required(p.system);
  });

  constructor() {
    effect(() => {
      this.updateForm(this.item());
    });

    // auto convert from label, when the user types in it: setting the
    // other field from code does not fire input events, so the two
    // conversions cannot trigger each other
    this._labelInput
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(() => {
        const draft = this._draft();
        if (draft.system) {
          const result = this._converter.getLocation(draft.system, draft.label);
          this.copy(result);
          this.form.location().value.set(result || '');
        }
      });

    // auto convert from location, when the user types in it
    this._locationInput
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(() => {
        const draft = this._draft();
        if (draft.system) {
          const result = this._converter.getLabel(draft.system, draft.location);
          this.copy(result);
          this.form.label().value.set(result || '');
        }
      });
  }

  private copy(result: string | null): void {
    if (this._draft().autoCopy && result) {
      this._clipboard.copy(result);
      this._snackbar.open('Copied ' + result, 'OK', {
        duration: 1000,
      });
    }
  }

  public onLabelInput(): void {
    this._labelInput.next();
  }

  public onLocationInput(): void {
    this._locationInput.next();
  }

  public onItemChange(item: unknown): void {
    this.item.set(item as Item);
  }

  private resetForm(): void {
    this._converter.setRows([]);
    this._draft.set(makeDefaultDraft());
    this.form().reset();
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
          this._draft.set(makeDefaultDraft());
          this.form().reset();
          const p = part as CodSheetLabelsPart;
          if (!p) {
            this.resetForm();
            this.loading.set(false);
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

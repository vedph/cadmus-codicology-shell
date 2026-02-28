import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { take } from 'rxjs/operators';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { deepCopy, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  CodWatermark,
  CodWatermarksPart,
  COD_WATERMARKS_PART_TYPEID,
} from '../cod-watermarks-part';
import { CodWatermarkEditorComponent } from '../cod-watermark-editor/cod-watermark-editor.component';

interface CodWatermarksPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

/**
 * CodWatermarksPart editor component.
 * Thesauri: asserted-id-tags, asserted-id-scopes,
 * chronotope-tags, assertion-tags, doc-reference-types,
 * doc-reference-tags, physical-size-tags, physical-size-dim-tags,
 * physical-size-units, pin-link-settings (all optional).
 */
@Component({
  selector: 'cadmus-cod-watermarks-part',
  templateUrl: './cod-watermarks-part.component.html',
  styleUrls: ['./cod-watermarks-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatExpansionModule,
    MatButton,
    MatIconButton,
    MatTooltip,
    TitleCasePipe,
    CodWatermarkEditorComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
    CodLocationRangePipe,
  ],
})
export class CodWatermarksPartComponent
  extends ModelEditorComponentBase<CodWatermarksPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly editedWatermark = signal<CodWatermark | undefined>(undefined);

  // asserted-id-tags
  public readonly idTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // asserted-id-scopes
  public readonly idScopeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // chronotope-tags
  public readonly ctTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // doc-reference-types
  public readonly refTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // doc-reference-tags
  public readonly refTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // physical-size-tags
  public readonly szTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // physical-size-dim-tags
  public readonly szDimTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // physical-size-units
  public readonly szUnitEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  public watermarks: FormControl<CodWatermark[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
    super(authService, formBuilder);
    // form
    this.watermarks = formBuilder.control([], {
      nonNullable: true,
      validators: NgxToolsValidators.strictMinLengthValidator(1),
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      watermarks: this.watermarks,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
    }
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries.set(thesauri[key].entries);
    } else {
      this.idScopeEntries.set(undefined);
    }
    key = 'chronotope-tags';
    if (this.hasThesaurus(key)) {
      this.ctTagEntries.set(thesauri[key].entries);
    } else {
      this.ctTagEntries.set(undefined);
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.refTypeEntries.set(thesauri[key].entries);
    } else {
      this.refTypeEntries.set(undefined);
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries.set(thesauri[key].entries);
    } else {
      this.refTagEntries.set(undefined);
    }
    key = 'physical-size-tags';
    if (this.hasThesaurus(key)) {
      this.szTagEntries.set(thesauri[key].entries);
    } else {
      this.szTagEntries.set(undefined);
    }
    key = 'physical-size-dim-tags';
    if (this.hasThesaurus(key)) {
      this.szDimTagEntries.set(thesauri[key].entries);
    } else {
      this.szDimTagEntries.set(undefined);
    }
    key = 'physical-size-units';
    if (this.hasThesaurus(key)) {
      this.szUnitEntries.set(thesauri[key].entries);
    } else {
      this.szUnitEntries.set(undefined);
    }
  }

  private updateForm(part?: CodWatermarksPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.watermarks.setValue(part.watermarks || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodWatermarksPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }
    // settings
    this._appRepository
      ?.getSettingFor<CodWatermarksPartSettings>(
        COD_WATERMARKS_PART_TYPEID,
        this.identity()?.roleId || undefined,
      )
      .then((settings) => {
        const options = settings?.lookupProviderOptions;
        this.lookupProviderOptions.set(options || undefined);
      });
    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodWatermarksPart {
    let part = this.getEditedPart(
      COD_WATERMARKS_PART_TYPEID,
    ) as CodWatermarksPart;
    part.watermarks = this.watermarks.value || [];
    return part;
  }

  public addWatermark(): void {
    this.editWatermark({
      name: '',
    });
  }

  public editWatermark(watermark: CodWatermark | null, index = -1): void {
    if (!watermark) {
      this.editedIndex.set(-1);
      this.editedWatermark.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedWatermark.set(deepCopy(watermark));
    }
  }

  public onWatermarkChange(watermark: CodWatermark): void {
    const watermarks = [...this.watermarks.value];

    if (this.editedIndex() > -1) {
      watermarks.splice(this.editedIndex(), 1, watermark);
    } else {
      watermarks.push(watermark);
    }

    this.watermarks.setValue(watermarks);
    this.watermarks.updateValueAndValidity();
    this.watermarks.markAsDirty();
    this.editWatermark(null);
  }

  public deleteWatermark(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete watermark?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.watermarks.value];
          entries.splice(index, 1);
          this.watermarks.setValue(entries);
          this.watermarks.updateValueAndValidity();
          this.watermarks.markAsDirty();
        }
      });
  }

  public moveWatermarkUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.watermarks.value[index];
    const entries = [...this.watermarks.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.watermarks.setValue(entries);
    this.watermarks.updateValueAndValidity();
    this.watermarks.markAsDirty();
  }

  public moveWatermarkDown(index: number): void {
    if (index + 1 >= this.watermarks.value.length) {
      return;
    }
    const entry = this.watermarks.value[index];
    const entries = [...this.watermarks.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.watermarks.setValue(entries);
    this.watermarks.updateValueAndValidity();
    this.watermarks.markAsDirty();
  }
}

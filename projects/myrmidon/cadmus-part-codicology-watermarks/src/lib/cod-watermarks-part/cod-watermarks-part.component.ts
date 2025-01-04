import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  EditedObject,
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

import {
  CodWatermark,
  CodWatermarksPart,
  COD_WATERMARKS_PART_TYPEID,
} from '../cod-watermarks-part';
import { CodWatermarkEditorComponent } from '../cod-watermark-editor/cod-watermark-editor.component';

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
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatTabGroup,
    MatTab,
    MatButton,
    MatIconButton,
    MatTooltip,
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
  private _editedIndex: number;

  public tabIndex: number;
  public editedWatermark: CodWatermark | undefined;

  // asserted-id-tags
  public idTagEntries: ThesaurusEntry[] | undefined;
  // asserted-id-scopes
  public idScopeEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-tags
  public szTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-dim-tags
  public szDimTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-units
  public szUnitEntries: ThesaurusEntry[] | undefined;

  // pin links settings
  // by-type: true/false
  public pinByTypeMode?: boolean;
  // switch-mode: true/false
  public canSwitchMode?: boolean;
  // edit-target: true/false
  public canEditTarget?: boolean;

  public watermarks: FormControl<CodWatermark[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
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

  /**
   * Load settings from thesaurus entries.
   *
   * @param entries The thesaurus entries if any.
   */
  private loadSettings(entries?: ThesaurusEntry[]): void {
    if (!entries?.length) {
      this.pinByTypeMode = undefined;
      this.canSwitchMode = undefined;
      this.canEditTarget = undefined;
    }
    this.pinByTypeMode =
      entries?.find((e) => e.id === 'by-type')?.value === 'true';
    this.canSwitchMode =
      entries?.find((e) => e.id === 'switch-mode')?.value === 'true';
    this.canEditTarget =
      entries?.find((e) => e.id === 'edit-target')?.value === 'true';
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries = thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries = thesauri[key].entries;
    } else {
      this.idScopeEntries = undefined;
    }
    key = 'chronotope-tags';
    if (this.hasThesaurus(key)) {
      this.ctTagEntries = thesauri[key].entries;
    } else {
      this.ctTagEntries = undefined;
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries = thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.refTypeEntries = thesauri[key].entries;
    } else {
      this.refTypeEntries = undefined;
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries = thesauri[key].entries;
    } else {
      this.refTagEntries = undefined;
    }
    key = 'physical-size-tags';
    if (this.hasThesaurus(key)) {
      this.szTagEntries = thesauri[key].entries;
    } else {
      this.szTagEntries = undefined;
    }
    key = 'physical-size-dim-tags';
    if (this.hasThesaurus(key)) {
      this.szDimTagEntries = thesauri[key].entries;
    } else {
      this.szDimTagEntries = undefined;
    }
    key = 'physical-size-units';
    if (this.hasThesaurus(key)) {
      this.szUnitEntries = thesauri[key].entries;
    } else {
      this.szUnitEntries = undefined;
    }
    this.loadSettings(thesauri['pin-link-settings']?.entries);
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

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodWatermarksPart {
    let part = this.getEditedPart(
      COD_WATERMARKS_PART_TYPEID
    ) as CodWatermarksPart;
    part.watermarks = this.watermarks.value || [];
    return part;
  }

  public addWatermark(): void {
    this.editWatermark({
      name: '',
      sampleRange: {
        start: { n: 0 },
        end: { n: 0 },
      },
    });
  }

  public editWatermark(watermark: CodWatermark | null, index = -1): void {
    if (!watermark) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedWatermark = undefined;
    } else {
      this._editedIndex = index;
      this.editedWatermark = watermark;
      setTimeout(() => {
        this.tabIndex = 1;
      });
    }
  }

  public onWatermarkSave(watermark: CodWatermark): void {
    const watermarks = [...this.watermarks.value];

    if (this._editedIndex > -1) {
      watermarks.splice(this._editedIndex, 1, watermark);
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

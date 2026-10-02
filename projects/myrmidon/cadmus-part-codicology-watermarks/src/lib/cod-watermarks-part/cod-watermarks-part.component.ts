import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
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

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
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

interface CodWatermarksPartControls {
  watermarks: CodWatermark[];
}

function toDraft(part?: CodWatermarksPart | null): CodWatermarksPartControls {
  // copy: the form tags the objects in its arrays
  return {
    watermarks: copyFormValue(part?.watermarks || []),
  };
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
    HelpLinkComponent,
  ],
})
export class CodWatermarksPartComponent
  extends ModelEditorComponentBase<CodWatermarksPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly editedWatermark = signal<CodWatermark | undefined>(undefined);

  // asserted-id-tags
  public readonly idTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-tags']?.entries,
  );
  // asserted-id-scopes
  public readonly idScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-scopes']?.entries,
  );
  // chronotope-tags
  public readonly ctTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['chronotope-tags']?.entries,
  );
  // assertion-tags
  public readonly assTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['assertion-tags']?.entries,
  );
  // doc-reference-types
  public readonly refTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly refTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );
  // physical-size-tags
  public readonly szTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-tags']?.entries,
  );
  // physical-size-dim-tags
  public readonly szDimTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-dim-tags']?.entries,
  );
  // physical-size-units
  public readonly szUnitEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-units']?.entries,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);


  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.watermarks, 1);
  });

  constructor() {
    super();
    this.initSettings<CodWatermarksPartSettings>(COD_WATERMARKS_PART_TYPEID, (settings) =>
      this.lookupProviderOptions.set(settings?.lookupProviderOptions || undefined),
    );
  }

  protected getValue(): CodWatermarksPart {
    const part = this.getEditedPart(COD_WATERMARKS_PART_TYPEID) as CodWatermarksPart;
    part.watermarks = copyFormValue(this._draft().watermarks);
    return part;
  }

  private setWatermarks(watermarks: CodWatermark[]): void {
    this.form.watermarks().value.set(watermarks);
    this.form.watermarks().markAsDirty();
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
      this.editedWatermark.set(structuredClone(watermark));
    }
  }

  public onWatermarkChange(watermark: CodWatermark): void {
    const watermarks = [...this.form.watermarks().value()];

    if (this.editedIndex() > -1) {
      watermarks.splice(this.editedIndex(), 1, watermark);
    } else {
      watermarks.push(watermark);
    }

    this.setWatermarks(watermarks);
    this.editWatermark(null);
  }

  public deleteWatermark(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete watermark?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.form.watermarks().value()];
          entries.splice(index, 1);
          this.setWatermarks(entries);
        }
      });
  }

  public moveWatermarkUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.form.watermarks().value()[index];
    const entries = [...this.form.watermarks().value()];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.setWatermarks(entries);
  }

  public moveWatermarkDown(index: number): void {
    if (index + 1 >= this.form.watermarks().value().length) {
      return;
    }
    const entry = this.form.watermarks().value()[index];
    const entries = [...this.form.watermarks().value()];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.setWatermarks(entries);
  }
}

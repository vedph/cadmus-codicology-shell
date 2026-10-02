import { Component, linkedSignal } from '@angular/core';
import { FormField, maxLength } from '@angular/forms/signals';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';

import {
  COD_LOCATION_RANGES_PART_TYPEID,
  CodLocationRangesPart,
} from '../cod-location-ranges-part';
import {
  CodLocationComponent,
  CodLocationRange,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';

interface CodLocationRangesPartControls {
  ranges: CodLocationRange[];
  note: string;
}

function toDraft(
  part?: CodLocationRangesPart | null,
): CodLocationRangesPartControls {
  return {
    ranges: copyFormValue(part?.ranges || []),
    note: part?.note || '',
  };
}

/**
 * CodLocationRangesPart editor component.
 */
@Component({
  selector: 'cadmus-cod-location-ranges-part',
  imports: [
    CommonModule,
    FormField,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    CloseSaveButtonsComponent,
    CodLocationComponent,
    HelpLinkComponent,
  ],
  templateUrl: './cod-location-ranges-part.html',
  styleUrl: './cod-location-ranges-part.css',
})
export class CodLocationRangesPartComponent extends ModelEditorComponentBase<CodLocationRangesPart> {
  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    maxLength(p.note, 5000);
  });

  public onLocationChange(location: CodLocationRange[]): void {
    // ignore emissions not changing the location (the location editor
    // emits its initial value when initialized)
    if (
      (CodLocationParser.rangesToString(location) || '') ===
      (CodLocationParser.rangesToString(this.form.ranges().value()) || '')
    ) {
      return;
    }
    this.form.ranges().value.set(copyFormValue(location || []));
    this.form.ranges().markAsDirty();
  }

  protected getValue(): CodLocationRangesPart {
    const part = this.getEditedPart(
      COD_LOCATION_RANGES_PART_TYPEID,
    ) as CodLocationRangesPart;
    const draft = this._draft();
    part.ranges = copyFormValue(draft.ranges);
    part.note = draft.note.trim() || undefined;
    return part;
  }
}

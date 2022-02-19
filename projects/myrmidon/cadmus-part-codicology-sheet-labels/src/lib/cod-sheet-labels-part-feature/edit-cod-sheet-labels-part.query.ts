import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditCodSheetLabelsPartStore } from './edit-cod-sheet-labels-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodSheetLabelsPartQuery extends EditPartQueryBase {
  constructor(store: EditCodSheetLabelsPartStore) {
    super(store);
  }
}

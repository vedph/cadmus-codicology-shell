import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditCodShelfmarksPartStore } from './edit-cod-shelfmarks-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodShelfmarksPartQuery extends EditPartQueryBase {
  constructor(store: EditCodShelfmarksPartStore) {
    super(store);
  }
}

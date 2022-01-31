import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditCodContentsPartStore } from './edit-cod-contents-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodContentsPartQuery extends EditPartQueryBase {
  constructor(store: EditCodContentsPartStore) {
    super(store);
  }
}

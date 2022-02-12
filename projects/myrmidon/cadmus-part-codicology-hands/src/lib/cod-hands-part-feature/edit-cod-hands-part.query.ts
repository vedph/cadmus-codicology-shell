import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditCodHandsPartStore } from './edit-cod-hands-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodHandsPartQuery extends EditPartQueryBase {
  constructor(store: EditCodHandsPartStore) {
    super(store);
  }
}

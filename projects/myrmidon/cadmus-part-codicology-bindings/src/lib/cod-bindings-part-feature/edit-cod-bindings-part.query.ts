import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditCodBindingsPartStore } from './edit-cod-bindings-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodBindingsPartQuery extends EditPartQueryBase {
  constructor(store: EditCodBindingsPartStore) {
    super(store);
  }
}

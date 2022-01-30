import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';
import { EditCodLayoutsPartStore } from './edit-cod-layouts-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodLayoutsPartQuery extends EditPartQueryBase {
  constructor(store: EditCodLayoutsPartStore) {
    super(store);
  }
}

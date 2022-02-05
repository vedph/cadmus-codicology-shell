import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';
import { EditCodDecorationsPartStore } from './edit-cod-decorations-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodDecorationsPartQuery extends EditPartQueryBase {
  constructor(store: EditCodDecorationsPartStore) {
    super(store);
  }
}

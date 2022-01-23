import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';
import { EditCodWatermarksPartStore } from './edit-cod-watermarks-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodWatermarksPartQuery extends EditPartQueryBase {
  constructor(store: EditCodWatermarksPartStore) {
    super(store);
  }
}

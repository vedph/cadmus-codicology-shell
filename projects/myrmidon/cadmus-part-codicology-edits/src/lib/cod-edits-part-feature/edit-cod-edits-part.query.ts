import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';
import { EditCodEditsPartStore } from './edit-cod-edits-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodEditsPartQuery extends EditPartQueryBase {
  constructor(store: EditCodEditsPartStore) {
    super(store);
  }
}

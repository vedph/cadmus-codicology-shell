import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditCodMaterialDscPartStore } from './edit-cod-material-dsc-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodMaterialDscPartQuery extends EditPartQueryBase {
  constructor(store: EditCodMaterialDscPartStore) {
    super(store);
  }
}

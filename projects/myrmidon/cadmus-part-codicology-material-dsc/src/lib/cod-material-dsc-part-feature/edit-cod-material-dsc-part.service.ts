import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditCodMaterialDscPartStore } from './edit-cod-material-dsc-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodMaterialDscPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodMaterialDscPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}

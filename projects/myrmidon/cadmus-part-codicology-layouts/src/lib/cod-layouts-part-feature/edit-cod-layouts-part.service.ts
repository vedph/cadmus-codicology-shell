import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditCodLayoutsPartStore } from './edit-cod-layouts-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodLayoutsPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodLayoutsPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}

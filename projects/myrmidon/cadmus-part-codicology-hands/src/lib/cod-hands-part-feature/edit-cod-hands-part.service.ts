import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';

import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditCodHandsPartStore } from './edit-cod-hands-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodHandsPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodHandsPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}

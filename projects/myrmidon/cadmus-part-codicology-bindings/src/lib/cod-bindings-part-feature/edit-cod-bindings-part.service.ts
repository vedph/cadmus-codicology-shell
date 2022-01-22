import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditCodBindingsPartStore } from './edit-cod-bindings-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodBindingsPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodBindingsPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}

import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditCodContentsPartStore } from './edit-cod-contents-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodContentsPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodContentsPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}

import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';
import { EditCodShelfmarksPartStore } from './edit-cod-shelfmarks-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodShelfmarksPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodShelfmarksPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}

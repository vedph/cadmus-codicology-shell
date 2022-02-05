import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditCodDecorationsPartStore } from './edit-cod-decorations-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodDecorationsPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodDecorationsPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}

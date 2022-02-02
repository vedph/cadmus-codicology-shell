import { Injectable } from '@angular/core';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditCodEditsPartStore } from './edit-cod-edits-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodEditsPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodEditsPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}

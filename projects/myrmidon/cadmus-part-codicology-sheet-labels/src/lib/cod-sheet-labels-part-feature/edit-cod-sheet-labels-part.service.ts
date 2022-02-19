import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditCodSheetLabelsPartStore } from './edit-cod-sheet-labels-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodSheetLabelsPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodSheetLabelsPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}

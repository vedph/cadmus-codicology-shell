import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';
import { EditCodWatermarksPartStore } from './edit-cod-watermarks-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodWatermarksPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodWatermarksPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}

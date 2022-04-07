import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ItemService } from '@myrmidon/cadmus-api';
import {
  RefLookupFilter,
  RefLookupService,
} from '@myrmidon/cadmus-refs-lookup';

export interface ItemRefLookupFilter extends RefLookupFilter {
  facetId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ItemRefLookupService implements RefLookupService {
  constructor(private _itemService: ItemService) {}

  public getName(item: any): string {
    return item?.title;
  }

  public lookup(filter: ItemRefLookupFilter, options?: any): Observable<any[]> {
    if (!filter.text) {
      return of([]);
    }
    return this._itemService
      .getItems({
        pageNumber: 1,
        pageSize: filter.limit,
        title: filter.text,
        facetId: filter.facetId,
      })
      .pipe(
        map((page) => {
          return page.items;
        })
      );
  }
}

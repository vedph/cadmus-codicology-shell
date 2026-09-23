import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ItemService } from '@myrmidon/cadmus-api';

import { ItemRefLookupService } from './item-ref-lookup.service';

describe('ItemRefLookupService', () => {
  let service: ItemRefLookupService;
  let itemService: { getItem: ReturnType<typeof vi.fn>; getItems: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    itemService = {
      getItem: vi.fn(),
      getItems: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: ItemService, useValue: itemService }],
    });
    service = TestBed.inject(ItemRefLookupService);
  });

  it('should be created with id "item"', () => {
    expect(service).toBeTruthy();
    expect(service.id).toBe('item');
  });

  it('getName should return the item title', () => {
    expect(service.getName({ title: 'Alpha' })).toBe('Alpha');
  });

  it('getName should return undefined for null item', () => {
    expect(service.getName(null)).toBeUndefined();
  });

  it('getById should get the item without parts', async () => {
    const item = { id: 'x', title: 'X' };
    itemService.getItem.mockReturnValue(of(item));

    const result = await firstValueFrom(service.getById('x'));

    expect(result).toBe(item);
    expect(itemService.getItem).toHaveBeenCalledWith('x', false);
  });

  it('lookup should return empty without calling API when no text', async () => {
    const result = await firstValueFrom(service.lookup({ text: undefined, limit: 5 }));

    expect(result).toEqual([]);
    expect(itemService.getItems).not.toHaveBeenCalled();
  });

  it('lookup should query items by title and facet', async () => {
    const items = [{ id: 'a' }, { id: 'b' }];
    itemService.getItems.mockReturnValue(of({ items, total: 2 }));

    const result = await firstValueFrom(
      service.lookup({ text: 'ab', limit: 7, facetId: 'f' }),
    );

    expect(result).toEqual(items);
    expect(itemService.getItems).toHaveBeenCalledWith(
      { title: 'ab', facetId: 'f' },
      1,
      7,
    );
  });
});

import { Clipboard } from '@angular/cdk/clipboard';
import { inputBinding, signal, twoWayBinding } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ItemService } from '@myrmidon/cadmus-api';
import { ItemRefLookupService } from '@myrmidon/cadmus-codicology-ui';
import { Item } from '@myrmidon/cadmus-core';

import { CodSheetLabelsPart } from '../cod-sheet-labels-part';
import { CodLocationConverterComponent } from './cod-location-converter.component';

describe('CodLocationConverterComponent', () => {
  const ITEM = { id: 'item1', title: 'Item 1' } as Item;
  const PART = {
    rows: [
      {
        id: '1r',
        columns: [
          { id: 'n.alpha', value: 'i' },
          { id: 'n.beta', value: '10' },
        ],
      },
      {
        id: '1v',
        columns: [
          { id: 'n.alpha', value: 'ii' },
          { id: 'n.beta', value: '20' },
        ],
      },
    ],
  } as unknown as CodSheetLabelsPart;

  async function setup(options?: {
    item?: Item;
    user?: boolean;
    part?: CodSheetLabelsPart | null;
  }) {
    const item = signal<Item | undefined>(options?.item);
    const itemService = {
      getPartFromTypeAndRole: vi.fn(() =>
        of(options?.part === null ? null : (options?.part ?? PART)),
      ),
    };
    const clipboard = { copy: vi.fn() };
    const snackbar = { open: vi.fn() };
    const user = options?.user === false ? null : { userName: 'zeus' };
    const result = await render(CodLocationConverterComponent, {
      bindings: [
        twoWayBinding('item', item),
        inputBinding('facetId', () => 'codex'),
      ],
      providers: [
        { provide: ItemService, useValue: itemService },
        {
          provide: ItemRefLookupService,
          useValue: {
            id: 'item',
            getName: (i: Item) => i?.title,
            lookup: () => of([ITEM]),
          },
        },
        {
          provide: AuthJwtService,
          useValue: { currentUser$: of(user), currentUserValue: user },
        },
        { provide: Clipboard, useValue: clipboard },
      ],
      configureTestBed: (tb) =>
        tb.overrideProvider(MatSnackBar, { useValue: snackbar }),
    });
    return {
      ...result,
      item,
      itemService,
      clipboard,
      snackbar,
      user: userEvent.setup(),
    };
  }

  /** Pick the item via the item lookup. */
  async function pickItem(user: ReturnType<typeof userEvent.setup>) {
    // the lookup is inactive until its button is clicked
    await user.click(screen.getByRole('button', { name: 'item' }));
    await user.type(screen.getByPlaceholderText('item'), 'Item');
    await user.click(await screen.findByRole('option', { name: 'Item 1' }));
  }

  async function pickSystem(
    user: ReturnType<typeof userEvent.setup>,
    system: string,
  ) {
    await user.click(screen.getByRole('combobox', { name: /system/ }));
    await user.click(await screen.findByRole('option', { name: system }));
  }

  it('should render nothing without a logged user', async () => {
    await setup({ item: ITEM, user: false });

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByText('copy')).toBeNull();
  });

  it('should update the item model when picking an item', async () => {
    const { user, item } = await setup();

    await pickItem(user);

    expect(item()).toEqual(ITEM);
  });

  it('should load the sheet labels of an item received as input', async () => {
    const { user, itemService } = await setup({ item: ITEM });

    expect(itemService.getPartFromTypeAndRole).toHaveBeenCalledWith(
      'item1',
      'it.vedph.codicology.sheet-labels',
    );
    await pickSystem(user, 'n.alpha');
    expect(screen.getByRole('textbox', { name: /label/ })).toBeInTheDocument();
  });

  it('should clear an item received as input', async () => {
    const { user, item } = await setup({ item: ITEM });

    // the inactive lookup shows the item name in its button
    await user.click(screen.getByRole('button', { name: 'Item 1' }));
    // the lookup's clear button has no accessible name: find it by its icon
    await user.click(screen.getByText('clear').closest('button')!);

    expect(item()).toBeUndefined();
    expect(screen.getByText('(no systems)')).toBeInTheDocument();
  });

  it('should stop loading when the item has no sheet labels', async () => {
    const { user } = await setup({ part: null as any });
    // no part: getPartFromTypeAndRole emits null
    await pickItem(user);

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByText('(no systems)')).toBeInTheDocument();
  });

  it('should show no systems without an item', async () => {
    const { itemService } = await setup();

    expect(itemService.getPartFromTypeAndRole).not.toHaveBeenCalled();
    expect(screen.getByText('(no systems)')).toBeInTheDocument();
  });

  it('should load the sheet labels of the item and list its systems', async () => {
    const { user, itemService } = await setup();
    await pickItem(user);

    expect(itemService.getPartFromTypeAndRole).toHaveBeenCalledWith(
      'item1',
      'it.vedph.codicology.sheet-labels',
    );
    await user.click(screen.getByRole('combobox', { name: /system/ }));
    expect(
      await screen.findByRole('option', { name: 'n.alpha' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'n.beta' })).toBeInTheDocument();
  });

  it('should convert a label into a location', async () => {
    const { user } = await setup();
    await pickItem(user);
    await pickSystem(user, 'n.alpha');

    await user.type(screen.getByRole('textbox', { name: /label/ }), 'ii');

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /location/ })).toHaveValue(
        '1v',
      ),
    );
  });

  it('should convert a location into a label', async () => {
    const { user } = await setup();
    await pickItem(user);
    await pickSystem(user, 'n.beta');

    await user.type(screen.getByRole('textbox', { name: /location/ }), '1r');

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /label/ })).toHaveValue('10'),
    );
  });

  it('should copy the conversion result when auto-copy is on', async () => {
    const { user, clipboard, snackbar } = await setup();
    await pickItem(user);
    await pickSystem(user, 'n.alpha');

    await user.click(screen.getByRole('switch', { name: /copy/ }));
    await user.type(screen.getByRole('textbox', { name: /label/ }), 'i');

    await waitFor(() => expect(clipboard.copy).toHaveBeenCalledWith('1r'));
    expect(snackbar.open).toHaveBeenCalledWith(
      'Copied 1r',
      'OK',
      expect.anything(),
    );
  });

  it('should not copy when auto-copy is off', async () => {
    const { user, clipboard } = await setup();
    await pickItem(user);
    await pickSystem(user, 'n.alpha');

    await user.type(screen.getByRole('textbox', { name: /label/ }), 'i');

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /location/ })).toHaveValue(
        '1r',
      ),
    );
    expect(clipboard.copy).not.toHaveBeenCalled();
  });
});

import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import {
  buildPart,
  createFeatureMocks,
  overrideFeatureMocks,
  provideFeatureMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_LOCATION_RANGES_PART_TYPEID,
  CodLocationRangesPart,
} from '../cod-location-ranges-part';
import { CodLocationRangesPartFeature } from './cod-location-ranges-part-feature';

describe('CodLocationRangesPartFeature', () => {
  const PART = buildPart<CodLocationRangesPart>(
    COD_LOCATION_RANGES_PART_TYPEID,
    {
      ranges: [{ start: { n: 1 }, end: { n: 3 } }],
      note: 'a note',
    },
  );

  async function setup(partId = 'p1') {
    const mocks = createFeatureMocks({
      typeId: COD_LOCATION_RANGES_PART_TYPEID,
      part: partId === 'new' ? undefined : PART,
      partId,
    });
    const result = await render(CodLocationRangesPartFeature, {
      providers: provideFeatureMocks(mocks),
      configureTestBed: overrideFeatureMocks(mocks),
    });
    return { ...result, mocks, user: userEvent.setup() };
  }

  it('should show the current item and the loaded part', async () => {
    await setup();

    expect(screen.getByText('Test item')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /^note/ })).toHaveValue(
        'a note',
      ),
    );
  });

  it('should load the part without thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: 'item1',
        typeId: COD_LOCATION_RANGES_PART_TYPEID,
        partId: 'p1',
        roleId: null,
      },
      [],
    );
  });

  it('should load a new part with a null part ID', async () => {
    const { mocks } = await setup('new');

    expect(mocks.editorService.load.mock.calls[0][0].partId).toBeNull();
  });

  it('should save the part', async () => {
    const { user, mocks } = await setup();
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /^note/ })).toHaveValue(
        'a note',
      ),
    );

    await user.click(screen.getByRole('button', { name: /save/ }));

    await waitFor(() =>
      expect(mocks.editorService.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p1', note: 'a note' }),
      ),
    );
    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith(
        'Part saved',
        'OK',
        expect.anything(),
      ),
    );
  });

  it('should navigate back to the item on close', async () => {
    const { user, mocks } = await setup();

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(mocks.router.navigate).toHaveBeenCalledWith(['items', 'item1']);
  });
});

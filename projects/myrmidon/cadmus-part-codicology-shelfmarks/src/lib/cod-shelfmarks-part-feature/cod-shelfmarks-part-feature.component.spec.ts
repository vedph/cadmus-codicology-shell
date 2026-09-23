import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import {
  buildPart,
  createFeatureMocks,
  overrideFeatureMocks,
  provideFeatureMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_SHELFMARKS_PART_TYPEID,
  CodShelfmarksPart,
} from '../cod-shelfmarks-part';
import { CodShelfmarksPartFeatureComponent } from './cod-shelfmarks-part-feature.component';

describe('CodShelfmarksPartFeatureComponent', () => {
  const PART = buildPart<CodShelfmarksPart>(COD_SHELFMARKS_PART_TYPEID, {
    shelfmarks: [{ city: 'Venice', library: 'Marciana', location: 'Z 1' }],
  });

  async function setup(options?: { roleId?: string }) {
    const mocks = createFeatureMocks({
      typeId: COD_SHELFMARKS_PART_TYPEID,
      part: PART,
      partId: 'p1',
      roleId: options?.roleId,
    });
    const result = await render(CodShelfmarksPartFeatureComponent, {
      providers: provideFeatureMocks(mocks),
      configureTestBed: overrideFeatureMocks(mocks),
    });
    // wait for the part to be loaded into the editor
    await screen.findByText('Z 1');
    return { ...result, mocks, user: userEvent.setup() };
  }

  it('should show the current item and the part editor', async () => {
    await setup();

    expect(screen.getByText('Test item')).toBeInTheDocument();
    expect(screen.getByText('Shelfmarks Part')).toBeInTheDocument();
  });

  it('should load the part with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: 'item1',
        typeId: COD_SHELFMARKS_PART_TYPEID,
        partId: 'p1',
        roleId: null,
      },
      [
        'cod-shelfmark-tags',
        'cod-shelfmark-cities',
        'cod-shelfmark-libraries',
      ],
    );
  });

  it('should save the part', async () => {
    const { user, mocks } = await setup();

    await user.click(screen.getByRole('button', { name: /save/ }));

    await waitFor(() =>
      expect(mocks.editorService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'p1',
          typeId: COD_SHELFMARKS_PART_TYPEID,
          shelfmarks: PART.shelfmarks,
        }),
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

  it('should report save errors', async () => {
    const { user, mocks } = await setup();
    mocks.editorService.save.mockRejectedValue(new Error('boom'));

    await user.click(screen.getByRole('button', { name: /save/ }));

    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith('boom', 'OK'),
    );
  });

  it('should navigate back to the item on close', async () => {
    const { user, mocks } = await setup();

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(mocks.router.navigate).toHaveBeenCalledWith(['items', 'item1']);
  });
});

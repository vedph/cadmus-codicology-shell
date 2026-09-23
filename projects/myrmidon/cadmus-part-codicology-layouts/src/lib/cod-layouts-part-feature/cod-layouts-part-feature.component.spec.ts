import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import {
  buildPart,
  createFeatureMocks,
  overrideFeatureMocks,
  provideFeatureMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_LAYOUTS_PART_TYPEID,
  CodLayoutsPart,
} from '../cod-layouts-part';
import { CodLayoutsPartFeatureComponent } from './cod-layouts-part-feature.component';

describe('CodLayoutsPartFeatureComponent', () => {
  const PART = buildPart<CodLayoutsPart>(COD_LAYOUTS_PART_TYPEID, {
    layouts: [{ sample: { n: 11 }, ranges: [{ start: { n: 10 }, end: { n: 20 } }], columnCount: 2 }],
  });

  async function setup(options?: { roleId?: string }) {
    const mocks = createFeatureMocks({
      typeId: COD_LAYOUTS_PART_TYPEID,
      part: PART,
      partId: 'p1',
      roleId: options?.roleId,
    });
    const result = await render(CodLayoutsPartFeatureComponent, {
      providers: [...provideFeatureMocks(mocks)],
      configureTestBed: overrideFeatureMocks(mocks),
    });
    // wait for the part to be loaded into the editor
    await screen.findByText('10-20');
    return { ...result, mocks, user: userEvent.setup() };
  }

  it('should show the current item and the part editor', async () => {
    await setup();

    expect(screen.getByText('Test item')).toBeInTheDocument();
    expect(screen.getByText('Manuscript Layouts Part')).toBeInTheDocument();
  });

  it('should load the part with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: 'item1',
        typeId: COD_LAYOUTS_PART_TYPEID,
        partId: 'p1',
        roleId: null,
      },
      [
        'cod-layout-tags',
        'cod-layout-ruling-techniques',
        'cod-layout-derolez',
        'cod-layout-prickings',
        'decorated-count-ids',
        'decorated-count-tags',
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
          typeId: COD_LAYOUTS_PART_TYPEID,
          layouts: PART.layouts,
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

import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import {
  buildPart,
  createFeatureMocks,
  overrideFeatureMocks,
  provideFeatureMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_HANDS_PART_TYPEID,
  CodHandsPart,
} from '../cod-hands-part';
import { CodHandsPartFeatureComponent } from './cod-hands-part-feature.component';

describe('CodHandsPartFeatureComponent', () => {
  const PART = buildPart<CodHandsPart>(COD_HANDS_PART_TYPEID, {
    hands: [{
    eid: 'h1',
    name: 'Hand A',
    descriptions: [],
    instances: [
      {
        scripts: ['goth'],
        typologies: ['book'],
        ranges: [{ start: { n: 1 }, end: { n: 2 } }],
      },
    ],
  }],
  });

  async function setup(options?: { roleId?: string }) {
    const mocks = createFeatureMocks({
      typeId: COD_HANDS_PART_TYPEID,
      part: PART,
      partId: 'p1',
      roleId: options?.roleId,
    });
    const result = await render(CodHandsPartFeatureComponent, {
      providers: [...provideFeatureMocks(mocks)],
      configureTestBed: overrideFeatureMocks(mocks),
    });
    // wait for the part to be loaded into the editor
    await screen.findByText('Hand A');
    return { ...result, mocks, user: userEvent.setup() };
  }

  it('should show the current item and the part editor', async () => {
    await setup();

    expect(screen.getByText('Test item')).toBeInTheDocument();
    expect(screen.getByText('Hands Part')).toBeInTheDocument();
  });

  it('should load the part with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: 'item1',
        typeId: COD_HANDS_PART_TYPEID,
        partId: 'p1',
        roleId: null,
      },
      [
        'cod-hand-sign-types',
        'cod-hand-scripts',
        'cod-hand-typologies',
        'cod-hand-colors',
        'chronotope-tags',
        'assertion-tags',
        'doc-reference-types',
        'doc-reference-tags',
        'cod-image-types',
        'cod-hand-subscription-languages',
        'external-id-tags',
        'external-id-scopes',
      ],
    );
  });

  it('should suffix thesauri IDs with the role ID', async () => {
    const { mocks } = await setup({ roleId: 'r' });

    expect(mocks.editorService.load.mock.calls[0][1]).toContain(
      'cod-hand-sign-types_r',
    );
  });

  it('should save the part', async () => {
    const { user, mocks } = await setup();

    await user.click(screen.getByRole('button', { name: /save/ }));

    await waitFor(() =>
      expect(mocks.editorService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'p1',
          typeId: COD_HANDS_PART_TYPEID,
          hands: PART.hands,
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

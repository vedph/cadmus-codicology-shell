import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import {
  buildPart,
  createFeatureMocks,
  overrideFeatureMocks,
  provideFeatureMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_MATERIAL_DSC_PART_TYPEID,
  CodMaterialDscPart,
} from '../cod-material-dsc-part';
import { CodMaterialDscPartFeatureComponent } from './cod-material-dsc-part-feature.component';

describe('CodMaterialDscPartFeatureComponent', () => {
  const PART = buildPart<CodMaterialDscPart>(COD_MATERIAL_DSC_PART_TYPEID, {
    units: [{ material: 'parch', format: 'fol', state: 'good', ranges: [{ start: { n: 1 }, end: { n: 10 } }] }],
  });

  async function setup(options?: { roleId?: string }) {
    const mocks = createFeatureMocks({
      typeId: COD_MATERIAL_DSC_PART_TYPEID,
      part: PART,
      partId: 'p1',
      roleId: options?.roleId,
    });
    const result = await render(CodMaterialDscPartFeatureComponent, {
      providers: [...provideFeatureMocks(mocks)],
      configureTestBed: overrideFeatureMocks(mocks),
    });
    // wait for the part to be loaded into the editor
    await screen.findByText('parch');
    return { ...result, mocks, user: userEvent.setup() };
  }

  it('should show the current item and the part editor', async () => {
    await setup();

    expect(screen.getByText('Test item')).toBeInTheDocument();
    expect(screen.getByText('Material Description Part')).toBeInTheDocument();
  });

  it('should load the part with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: 'item1',
        typeId: COD_MATERIAL_DSC_PART_TYPEID,
        partId: 'p1',
        roleId: null,
      },
      [
        'cod-unit-tags',
        'cod-unit-materials',
        'cod-unit-formats',
        'cod-unit-states',
        'chronotope-tags',
        'assertion-tags',
        'doc-reference-types',
        'doc-reference-tags',
      ],
    );
  });

  it('should suffix thesauri IDs with the role ID', async () => {
    const { mocks } = await setup({ roleId: 'r' });

    expect(mocks.editorService.load.mock.calls[0][1]).toContain(
      'cod-unit-tags_r',
    );
  });

  it('should save the part', async () => {
    const { user, mocks } = await setup();

    await user.click(screen.getByRole('button', { name: /save/ }));

    await waitFor(() =>
      expect(mocks.editorService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'p1',
          typeId: COD_MATERIAL_DSC_PART_TYPEID,
          units: PART.units,
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

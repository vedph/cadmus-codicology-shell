import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import {
  buildPart,
  createFeatureMocks,
  overrideFeatureMocks,
  provideFeatureMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import { COD_BINDINGS_PART_TYPEID, CodBindingsPart } from '../cod-bindings-part';
import { CodBindingsPartFeatureComponent } from './cod-bindings-part-feature.component';

describe('CodBindingsPartFeatureComponent', () => {
  const PART = buildPart<CodBindingsPart>(COD_BINDINGS_PART_TYPEID, {
    bindings: [
      {
        coverMaterial: 'leather',
        boardMaterial: 'wood',
        chronotope: { place: { value: 'Rome' } },
      },
    ],
  });

  async function setup(options?: { roleId?: string; part?: CodBindingsPart }) {
    const mocks = createFeatureMocks({
      typeId: COD_BINDINGS_PART_TYPEID,
      part: options?.part ?? PART,
      partId: 'p1',
      roleId: options?.roleId,
    });
    const result = await render(CodBindingsPartFeatureComponent, {
      providers: provideFeatureMocks(mocks),
      configureTestBed: overrideFeatureMocks(mocks),
    });
    return { ...result, mocks, user: userEvent.setup() };
  }

  it('should show the current item and the part editor', async () => {
    await setup();

    expect(screen.getByText('Test item')).toBeInTheDocument();
    expect(await screen.findByText('Bindings Part')).toBeInTheDocument();
  });

  it('should load the part with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: 'item1',
        typeId: COD_BINDINGS_PART_TYPEID,
        partId: 'p1',
        roleId: null,
      },
      expect.arrayContaining([
        'cod-binding-tags',
        'cod-binding-cover-materials',
        'cod-binding-board-materials',
        'physical-size-units',
      ]),
    );
    expect(await screen.findByText('leather')).toBeInTheDocument();
  });

  it('should suffix thesauri IDs with the role ID', async () => {
    const { mocks } = await setup({ roleId: 'r' });

    expect(mocks.editorService.load.mock.calls[0][1]).toContain(
      'cod-binding-tags_r',
    );
  });

  it('should save the part edited in the editor', async () => {
    const { user, mocks } = await setup();
    await screen.findByText('leather');

    // make the form dirty by moving through the editor: delete and save
    await user.click(
      screen.getByRole('button', { description: /delete this binding/i }),
    );
    await user.click(screen.getByRole('button', { name: /binding/ }));
    await user.type(screen.getByRole('textbox', { name: /cover material/ }), 'x');
    await user.type(screen.getByRole('textbox', { name: /board material/ }), 'y');
    await user.click(
      screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
    );
    await user.click(screen.getByRole('button', { name: /save/ }));

    await waitFor(() => expect(mocks.editorService.save).toHaveBeenCalled());
    const saved = mocks.editorService.save.mock.calls[0][0] as CodBindingsPart;
    expect(saved.bindings).toEqual([
      expect.objectContaining({ coverMaterial: 'x', boardMaterial: 'y' }),
    ]);
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
    await screen.findByText('leather');

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(mocks.router.navigate).toHaveBeenCalledWith(['items', 'item1']);
  });
});

import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NGX_MONACO_LOADER_PROVIDER } from '@jean-merelis/ngx-monaco-editor';
import { CadmusTextEdService } from '@myrmidon/cadmus-text-ed';

import {
  buildPart,
  createFeatureMocks,
  overrideFeatureMocks,
  provideFeatureMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_DECORATIONS_PART_TYPEID,
  CodDecorationsPart,
} from '../cod-decorations-part';
import { CodDecorationsPartFeatureComponent } from './cod-decorations-part-feature.component';

describe('CodDecorationsPartFeatureComponent', () => {
  const PART = buildPart<CodDecorationsPart>(COD_DECORATIONS_PART_TYPEID, {
    decorations: [{
    eid: 'd1',
    name: 'initials',
    elements: [
      { type: 'initial', flags: [], ranges: [{ start: { n: 1 }, end: { n: 1 } }] },
    ],
  }],
  });

  async function setup(options?: { roleId?: string }) {
    const mocks = createFeatureMocks({
      typeId: COD_DECORATIONS_PART_TYPEID,
      part: PART,
      partId: 'p1',
      roleId: options?.roleId,
    });
    const result = await render(CodDecorationsPartFeatureComponent, {
      providers: [...provideFeatureMocks(mocks),
        { provide: CadmusTextEdService, useValue: { edit: () => undefined } },
        // monaco is not available in jsdom: never load it
        {
          provide: NGX_MONACO_LOADER_PROVIDER,
          useValue: { monacoLoaded: () => new Promise(() => {}) },
        },
      ],
      configureTestBed: overrideFeatureMocks(mocks),
    });
    // wait for the part to be loaded into the editor
    await screen.findByText('initials');
    return { ...result, mocks, user: userEvent.setup() };
  }

  it('should show the current item and the part editor', async () => {
    await setup();

    expect(screen.getByText('Test item')).toBeInTheDocument();
    expect(screen.getByText('Manuscript Decorations Part')).toBeInTheDocument();
  });

  it('should load the part with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: 'item1',
        typeId: COD_DECORATIONS_PART_TYPEID,
        partId: 'p1',
        roleId: null,
      },
      [
        'cod-decoration-flags',
        'cod-decoration-element-flags',
        'cod-decoration-element-types',
        'cod-decoration-type-hidden',
        'cod-decoration-element-colors',
        'cod-decoration-element-gildings',
        'cod-decoration-element-tags',
        'cod-decoration-element-techniques',
        'cod-decoration-element-positions',
        'cod-decoration-element-tools',
        'cod-decoration-element-typologies',
        'cod-image-types',
        'cod-decoration-artist-types',
        'cod-decoration-artist-style-names',
        'chronotope-tags',
        'assertion-tags',
        'doc-reference-types',
        'doc-reference-tags',
        'external-id-tags',
        'external-id-scopes',
        'pin-link-settings',
      ],
    );
  });

  it('should suffix thesauri IDs with the role ID', async () => {
    const { mocks } = await setup({ roleId: 'r' });

    expect(mocks.editorService.load.mock.calls[0][1]).toContain(
      'cod-decoration-flags_r',
    );
  });

  it('should save the part', async () => {
    const { user, mocks } = await setup();

    await user.click(screen.getByRole('button', { name: /save/ }));

    await waitFor(() =>
      expect(mocks.editorService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'p1',
          typeId: COD_DECORATIONS_PART_TYPEID,
          decorations: PART.decorations,
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

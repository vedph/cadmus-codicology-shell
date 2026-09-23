import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { ThesaurusService } from '@myrmidon/cadmus-api';
import { CitSchemeService } from '@myrmidon/cadmus-refs-citation';

import {
  buildPart,
  createFeatureMocks,
  overrideFeatureMocks,
  provideFeatureMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_CONTENTS_PART_TYPEID,
  CodContentsPart,
} from '../cod-contents-part';
import { CodContentsPartFeatureComponent } from './cod-contents-part-feature.component';

describe('CodContentsPartFeatureComponent', () => {
  const PART = buildPart<CodContentsPart>(COD_CONTENTS_PART_TYPEID, {
    contents: [{
    ranges: [{ start: { n: 1 }, end: { n: 10 } }],
    states: [],
    title: 'Commedia',
    location: 'Inf.1',
  }],
  });

  async function setup(options?: { roleId?: string }) {
    const mocks = createFeatureMocks({
      typeId: COD_CONTENTS_PART_TYPEID,
      part: PART,
      partId: 'p1',
      roleId: options?.roleId,
    });
    const result = await render(CodContentsPartFeatureComponent, {
      providers: [...provideFeatureMocks(mocks),
        // required by the work ID and references editors
        { provide: 'indexLookupDefinitions', useValue: {} },
        {
          provide: ThesaurusService,
          useValue: { getThesaurus: () => of({ id: 'x', entries: [] }) },
        },
        {
          provide: CitSchemeService,
          useValue: { getSchemes: () => [], toString: () => '' },
        },
      ],
      configureTestBed: overrideFeatureMocks(mocks),
    });
    // wait for the part to be loaded into the editor
    await screen.findByText('Commedia');
    return { ...result, mocks, user: userEvent.setup() };
  }

  it('should show the current item and the part editor', async () => {
    await setup();

    expect(screen.getByText('Test item')).toBeInTheDocument();
    expect(screen.getByText('Contents Part')).toBeInTheDocument();
  });

  it('should load the part with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: 'item1',
        typeId: COD_CONTENTS_PART_TYPEID,
        partId: 'p1',
        roleId: null,
      },
      [
        'cod-content-states',
        'cod-content-tags',
        'cod-content-annotation-types',
        'cod-content-annotation-features',
        'cod-content-annotation-languages',
        'cod-content-gap-types',
        'cod-content-gap-tags',
        'assertion-tags',
        'doc-reference-types',
        'doc-reference-tags',
        'external-id-tags',
        'external-id-scopes',
      ],
    );
  });

  it('should suffix thesauri IDs with the role ID', async () => {
    const { mocks } = await setup({ roleId: 'r' });

    expect(mocks.editorService.load.mock.calls[0][1]).toContain(
      'cod-content-states_r',
    );
  });

  it('should save the part', async () => {
    const { user, mocks } = await setup();

    await user.click(screen.getByRole('button', { name: /save/ }));

    await waitFor(() =>
      expect(mocks.editorService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'p1',
          typeId: COD_CONTENTS_PART_TYPEID,
          contents: PART.contents,
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

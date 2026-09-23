import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';
import { of } from 'rxjs';
import { ThesaurusService } from '@myrmidon/cadmus-api';
import { CitSchemeService } from '@myrmidon/cadmus-refs-citation';
import {
  buildEditedPart,
  buildPart,
  buildThesauri,
  createEditorMocks,
  provideEditorMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_CONTENTS_PART_TYPEID,
  CodContent,
  CodContentsPart,
} from '../cod-contents-part';
import { CodContentsPartComponent } from './cod-contents-part.component';

describe('CodContentsPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_CONTENTS_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };
  const E1: CodContent = {
    ranges: [{ start: { n: 1 }, end: { n: 10 } }],
    states: [],
    title: 'Commedia',
    location: 'Inf.1',
  };
  const E2: CodContent = {
    ranges: [{ start: { n: 11 }, end: { n: 20 } }],
    states: [],
    title: 'Convivio',
  };
  const THESAURI: ThesauriSet = {};

  async function setup(options?: {
    entries?: CodContent[];
    thesauri?: ThesauriSet;
    roles?: string[];
    confirm?: boolean;
    settings?: any;
    extra?: Partial<CodContentsPart>;
  }) {
    const mocks = createEditorMocks(options);
    const data = signal<EditedObject<CodContentsPart> | undefined>(
      buildEditedPart(
        options?.entries
          ? buildPart<CodContentsPart>(COD_CONTENTS_PART_TYPEID, {
              contents: options.entries,
              ...options.extra,
            })
          : undefined,
        options?.thesauri ?? THESAURI,
      ),
    );
    const editorClose = vi.fn();
    const result = await render(CodContentsPartComponent, {
      bindings: [
        inputBinding('identity', () => IDENTITY),
        twoWayBinding('data', data),
        outputBinding('editorClose', editorClose),
      ],
      providers: [...provideEditorMocks(mocks),
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
    });
    return { ...result, data, mocks, editorClose, user: userEvent.setup() };
  }

  const rows = () => screen.queryAllByRole('row').slice(1);
  const partSaveButton = () => screen.getByRole('button', { name: /save/ });
  const rowButton = (row: number, description: RegExp) =>
    within(rows()[row]).getByRole('button', { description });
  // nested editors may have their own accept/discard buttons:
  // the entry editor's ones are the last in document order
  const acceptEntry = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;
  const discardEntry = () =>
    screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!;

  it('should show the default title', async () => {
    await setup();
    expect(screen.getByText('Contents Part')).toBeInTheDocument();
  });

  it('should list contents', async () => {
    await setup({ entries: [E1, E2] });

    expect(rows()).toHaveLength(2);
    expect(within(rows()[0]).getByText('Commedia')).toBeInTheDocument();
    expect(within(rows()[1]).getByText('Convivio')).toBeInTheDocument();
  });

  it('should not allow saving without contents', async () => {
    await setup();
    expect(partSaveButton()).toBeDisabled();
  });

  it('should hide save for users below operator level', async () => {
    await setup({ entries: [E1], roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should add a content and save the part', async () => {
    const { user, data } = await setup();

    await user.click(screen.getByRole('button', { name: /^content$/ }));
    expect(screen.getByText(/#0/)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /^ranges/ }), '5r');
    // let the location editor emit its debounced change
    await new Promise((r) => setTimeout(r, 350));
    await user.type(screen.getAllByRole('textbox', { name: /^title/ })[0], 'Vita nova');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.queryByText(/#0/)).toBeNull();

    await user.click(partSaveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_CONTENTS_PART_TYPEID);
    expect(part.contents).toHaveLength(1);
    expect(part.contents[0]).toEqual(expect.objectContaining({ title: 'Vita nova', ranges: [expect.anything()] }));
  });

  it('should edit an existing content', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this content/i));
    expect(screen.getByText(/#2/)).toBeInTheDocument();

    await user.type(screen.getAllByRole('textbox', { name: /^location/ })[0], 'I.1');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());
    await user.click(partSaveButton());

    expect(data()!.value!.contents[1]).toEqual(
      expect.objectContaining({ title: 'Convivio', location: 'I.1' }),
    );
    expect(data()!.value!.contents[0]).toEqual(E1);
  });

  it('should not save the part when accepting a content', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this content/i));
    await user.type(screen.getAllByRole('textbox', { name: /^location/ })[0], 'I.1');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    // the part is saved only via its own save button
    expect(data()!.value!.contents).toEqual([E1, E2]);
  });

  it('should close the content editor on cancel', async () => {
    const { user, data } = await setup({ entries: [E1] });

    await user.click(rowButton(0, /edit this content/i));
    await user.click(discardEntry());

    expect(screen.queryByText(/#1/)).toBeNull();
    expect(data()!.value!.contents).toEqual([E1]);
  });

  it('should delete a content after confirmation', async () => {
    const { user, mocks } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(0, /delete this content/i));

    expect(mocks.dialog.confirm).toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
    expect(within(rows()[0]).getByText('Convivio')).toBeInTheDocument();
  });

  it('should not delete a content when not confirmed', async () => {
    const { user } = await setup({ entries: [E1, E2], confirm: false });

    await user.click(rowButton(0, /delete this content/i));

    expect(rows()).toHaveLength(2);
  });

  it('should move contents up and down', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    expect(rowButton(0, /move this content up/i)).toBeDisabled();
    expect(rowButton(1, /move this content down/i)).toBeDisabled();

    await user.click(rowButton(0, /move this content down/i));
    expect(within(rows()[0]).getByText('Convivio')).toBeInTheDocument();
    await user.click(partSaveButton());
    expect(data()!.value!.contents).toEqual([E2, E1]);

    await user.click(rowButton(1, /move this content up/i));
    expect(within(rows()[0]).getByText('Commedia')).toBeInTheDocument();
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ entries: [E1] });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });

  it('should show ranges and location in the list', async () => {
    await setup({ entries: [E1] });

    expect(within(rows()[0]).getByText('1-10')).toBeInTheDocument();
    expect(within(rows()[0]).getByText('Inf.1')).toBeInTheDocument();
  });

  it('should load role-specific settings', async () => {
    const { mocks } = await setup({ entries: [E1] });

    expect(mocks.appRepository.getSettingFor).toHaveBeenCalledWith(
      COD_CONTENTS_PART_TYPEID,
      undefined,
    );
  });
});

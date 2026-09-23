import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';
import { NGX_MONACO_LOADER_PROVIDER } from '@jean-merelis/ngx-monaco-editor';
import { CadmusTextEdService } from '@myrmidon/cadmus-text-ed';
import {
  buildEditedPart,
  buildPart,
  buildThesauri,
  createEditorMocks,
  provideEditorMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_DECORATIONS_PART_TYPEID,
  CodDecoration,
  CodDecorationsPart,
} from '../cod-decorations-part';
import { CodDecorationsPartComponent } from './cod-decorations-part.component';

describe('CodDecorationsPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_DECORATIONS_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };
  const E1: CodDecoration = {
    eid: 'd1',
    name: 'initials',
    elements: [
      { type: 'initial', flags: [], ranges: [{ start: { n: 1 }, end: { n: 1 } }] },
    ],
  };
  const E2: CodDecoration = { eid: 'd2', name: 'frames' };
  const THESAURI: ThesauriSet = {};

  async function setup(options?: {
    entries?: CodDecoration[];
    thesauri?: ThesauriSet;
    roles?: string[];
    confirm?: boolean;
    settings?: any;
    extra?: Partial<CodDecorationsPart>;
  }) {
    const mocks = createEditorMocks(options);
    const data = signal<EditedObject<CodDecorationsPart> | undefined>(
      buildEditedPart(
        options?.entries
          ? buildPart<CodDecorationsPart>(COD_DECORATIONS_PART_TYPEID, {
              decorations: options.entries,
              ...options.extra,
            })
          : undefined,
        options?.thesauri ?? THESAURI,
      ),
    );
    const editorClose = vi.fn();
    const result = await render(CodDecorationsPartComponent, {
      bindings: [
        inputBinding('identity', () => IDENTITY),
        twoWayBinding('data', data),
        outputBinding('editorClose', editorClose),
      ],
      providers: [...provideEditorMocks(mocks),
        { provide: CadmusTextEdService, useValue: { edit: () => undefined } },
        // monaco is not available in jsdom: never load it
        {
          provide: NGX_MONACO_LOADER_PROVIDER,
          useValue: { monacoLoaded: () => new Promise(() => {}) },
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
    screen.getByRole('button', { description: /accept decoration changes/i });
  const discardEntry = () =>
    screen.getByRole('button', { description: /discard decoration changes/i });

  it('should show the default title', async () => {
    await setup();
    expect(screen.getByText('Manuscript Decorations Part')).toBeInTheDocument();
  });

  it('should list decorations', async () => {
    await setup({ entries: [E1, E2] });

    expect(rows()).toHaveLength(2);
    expect(within(rows()[0]).getByText('initials')).toBeInTheDocument();
    expect(within(rows()[1]).getByText('frames')).toBeInTheDocument();
  });

  it('should not allow saving without decorations', async () => {
    await setup();
    expect(partSaveButton()).toBeDisabled();
  });

  it('should hide save for users below operator level', async () => {
    await setup({ entries: [E1], roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should add a decoration and save the part', async () => {
    const { user, data } = await setup();

    await user.click(screen.getByRole('button', { name: /^decoration$/ }));
    expect(screen.getByText(/#0/)).toBeInTheDocument();

    await user.type(screen.getAllByRole('textbox', { name: /^name/ })[0], 'borders');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.queryByText(/#0/)).toBeNull();

    await user.click(partSaveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_DECORATIONS_PART_TYPEID);
    expect(part.decorations).toHaveLength(1);
    expect(part.decorations[0]).toEqual(expect.objectContaining({ name: 'borders' }));
  });

  it('should edit an existing decoration', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this decoration/i));
    expect(screen.getByText(/#2/)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /^note/ }), ' x ');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());
    await user.click(partSaveButton());

    expect(data()!.value!.decorations[1]).toEqual(
      expect.objectContaining({ eid: 'd2', name: 'frames', note: 'x' }),
    );
    expect(data()!.value!.decorations[0]).toEqual(E1);
  });

  it('should not save the part when accepting a decoration', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this decoration/i));
    await user.type(screen.getByRole('textbox', { name: /^note/ }), ' x ');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    // the part is saved only via its own save button
    expect(data()!.value!.decorations).toEqual([E1, E2]);
  });

  it('should close the decoration editor on cancel', async () => {
    const { user, data } = await setup({ entries: [E1] });

    await user.click(rowButton(0, /edit this decoration/i));
    await user.click(discardEntry());

    expect(screen.queryByText(/#1/)).toBeNull();
    expect(data()!.value!.decorations).toEqual([E1]);
  });

  it('should delete a decoration after confirmation', async () => {
    const { user, mocks } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(0, /delete this decoration/i));

    expect(mocks.dialog.confirm).toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
    expect(within(rows()[0]).getByText('frames')).toBeInTheDocument();
  });

  it('should not delete a decoration when not confirmed', async () => {
    const { user } = await setup({ entries: [E1, E2], confirm: false });

    await user.click(rowButton(0, /delete this decoration/i));

    expect(rows()).toHaveLength(2);
  });

  it('should move decorations up and down', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    expect(rowButton(0, /move this decoration up/i)).toBeDisabled();
    expect(rowButton(1, /move this decoration down/i)).toBeDisabled();

    await user.click(rowButton(0, /move this decoration down/i));
    expect(within(rows()[0]).getByText('frames')).toBeInTheDocument();
    await user.click(partSaveButton());
    expect(data()!.value!.decorations).toEqual([E2, E1]);

    await user.click(rowButton(1, /move this decoration up/i));
    expect(within(rows()[0]).getByText('initials')).toBeInTheDocument();
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ entries: [E1] });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });

  it('should show the elements count', async () => {
    await setup({ entries: [E1] });

    const cells = within(rows()[0]).getAllByRole('cell');
    expect(cells.at(-1)!.textContent?.trim()).toBe('1');
  });

  it('should show artists unless hidden by settings', async () => {
    const { user } = await setup({ entries: [E1] });

    await user.click(rowButton(0, /edit this decoration/i));

    expect(screen.getByRole('button', { name: /^artists/ })).toBeInTheDocument();
  });

  it('should hide artists when set by settings', async () => {
    const { user } = await setup({ entries: [E1], settings: { hideArtists: true } });

    await user.click(rowButton(0, /edit this decoration/i));

    expect(screen.queryByRole('button', { name: /^artists/ })).toBeNull();
  });
});

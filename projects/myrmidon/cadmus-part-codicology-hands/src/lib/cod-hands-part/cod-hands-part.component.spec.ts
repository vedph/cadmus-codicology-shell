import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';

import {
  buildEditedPart,
  buildPart,
  buildThesauri,
  createEditorMocks,
  provideEditorMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_HANDS_PART_TYPEID,
  CodHand,
  CodHandsPart,
} from '../cod-hands-part';
import { CodHandsPartComponent } from './cod-hands-part.component';

describe('CodHandsPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_HANDS_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };
  const E1: CodHand = {
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
  };
  const E2: CodHand = {
    eid: 'h2',
    name: 'Hand B',
    descriptions: [{ key: 'k' }],
    instances: [
      {
        scripts: ['goth'],
        typologies: ['book'],
        ranges: [{ start: { n: 3 }, end: { n: 4 } }],
      },
    ],
    subscriptions: [
      { ranges: [{ start: { n: 4 }, end: { n: 4 } }], language: 'lat' },
    ],
  };
  const THESAURI: ThesauriSet = buildThesauri({
    'cod-hand-scripts': [{ id: 'goth', value: 'Gothic' }],
    'cod-hand-typologies': [{ id: 'book', value: 'book hand' }],
  });

  async function setup(options?: {
    entries?: CodHand[];
    thesauri?: ThesauriSet;
    roles?: string[];
    confirm?: boolean;
    settings?: any;
    extra?: Partial<CodHandsPart>;
  }) {
    const mocks = createEditorMocks(options);
    const data = signal<EditedObject<CodHandsPart> | undefined>(
      buildEditedPart(
        options?.entries
          ? buildPart<CodHandsPart>(COD_HANDS_PART_TYPEID, {
              hands: options.entries,
              ...options.extra,
            })
          : undefined,
        options?.thesauri ?? THESAURI,
      ),
    );
    const editorClose = vi.fn();
    const result = await render(CodHandsPartComponent, {
      bindings: [
        inputBinding('identity', () => IDENTITY),
        twoWayBinding('data', data),
        outputBinding('editorClose', editorClose),
      ],
      providers: [...provideEditorMocks(mocks)],
    });
    return { ...result, data, mocks, editorClose, user: userEvent.setup() };
  }

  const rows = () => screen.queryAllByRole('row').slice(1);
  const partSaveButton = () => screen.getByRole('button', { name: /save/ });
  const rowButton = (row: number, description: RegExp) =>
    within(rows()[row]).getByRole('button', { description });
  // nested editors may have their own accept/discard buttons:
  // the entry editor's ones are the last in document order
  // the hand editor's own buttons are the last ones in its tab
  const acceptEntry = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;
  const discardEntry = () =>
    screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!;

  it('should show the default title', async () => {
    await setup();
    expect(screen.getByText('Hands Part')).toBeInTheDocument();
  });

  it('should list hands', async () => {
    await setup({ entries: [E1, E2] });

    expect(rows()).toHaveLength(2);
    expect(within(rows()[0]).getByText('Hand A')).toBeInTheDocument();
    expect(within(rows()[1]).getByText('Hand B')).toBeInTheDocument();
  });

  it('should not allow saving without hands', async () => {
    await setup();
    expect(partSaveButton()).toBeDisabled();
  });

  it('should hide save for users below operator level', async () => {
    await setup({ entries: [E1], roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should add a hand and save the part', async () => {
    const { user, data } = await setup();

    await user.click(screen.getByRole('button', { name: /^hand$/ }));
    expect(screen.getByRole('tab', { name: 'hand' })).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /^name/ }), 'Hand C');
    // a hand requires at least one instance
    await user.click(screen.getByRole('button', { name: /^instances/ }));
    await user.click(screen.getByRole('button', { name: /^instance$/ }));
    await user.click(screen.getByRole('combobox', { name: /script/ }));
    await user.click(await screen.findByRole('option', { name: 'Gothic' }));
    await user.click(
      screen.getByRole('button', { description: /add selected script/i }),
    );
    await user.click(screen.getByRole('checkbox', { name: /book hand/ }));
    await user.type(screen.getByRole('textbox', { name: /^range/ }), '5r');
    await new Promise((r) => setTimeout(r, 350));
    const instanceEditor = screen.getByRole('region', { name: /instance #0/ });
    await user.click(
      within(instanceEditor)
        .getAllByRole('button', { description: /accept changes/i })
        .at(-1)!,
    );

    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.queryByRole('tab', { name: 'hand' })).toBeNull();

    await user.click(partSaveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_HANDS_PART_TYPEID);
    expect(part.hands).toHaveLength(1);
    expect(part.hands[0]).toEqual(expect.objectContaining({
        name: 'Hand C',
        instances: [
          expect.objectContaining({ scripts: ['goth'], typologies: ['book'] }),
        ],
      }));
  });

  it('should edit an existing hand', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this hand/i));
    expect(screen.getByRole('textbox', { name: /^name/ })).toHaveValue('Hand B');

    await user.type(screen.getByRole('textbox', { name: /^name/ }), '2');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());
    await user.click(partSaveButton());

    expect(data()!.value!.hands[1]).toEqual(
      expect.objectContaining({ eid: 'h2', name: 'Hand B2' }),
    );
    expect(data()!.value!.hands[0]).toEqual(E1);
  });

  it('should not save the part when accepting a hand', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this hand/i));
    await user.type(screen.getByRole('textbox', { name: /^name/ }), '2');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    // the part is saved only via its own save button
    expect(data()!.value!.hands).toEqual([E1, E2]);
  });

  it('should close the hand editor on cancel', async () => {
    const { user, data } = await setup({ entries: [E1] });

    await user.click(rowButton(0, /edit this hand/i));
    await user.click(discardEntry());

    expect(screen.queryByRole('tab', { name: 'hand' })).toBeNull();
    expect(data()!.value!.hands).toEqual([E1]);
  });

  it('should delete a hand after confirmation', async () => {
    const { user, mocks } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(0, /delete this hand/i));

    expect(mocks.dialog.confirm).toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
    expect(within(rows()[0]).getByText('Hand B')).toBeInTheDocument();
  });

  it('should not delete a hand when not confirmed', async () => {
    const { user } = await setup({ entries: [E1, E2], confirm: false });

    await user.click(rowButton(0, /delete this hand/i));

    expect(rows()).toHaveLength(2);
  });

  it('should move hands up and down', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    expect(rowButton(0, /move this hand up/i)).toBeDisabled();
    expect(rowButton(1, /move this hand down/i)).toBeDisabled();

    await user.click(rowButton(0, /move this hand down/i));
    expect(within(rows()[0]).getByText('Hand B')).toBeInTheDocument();
    await user.click(partSaveButton());
    expect(data()!.value!.hands).toEqual([E2, E1]);

    await user.click(rowButton(1, /move this hand up/i));
    expect(within(rows()[0]).getByText('Hand A')).toBeInTheDocument();
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ entries: [E1] });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });

  it('should show descriptions, instances and subscriptions counts', async () => {
    await setup({ entries: [E2] });

    const cells = within(rows()[0]).getAllByRole('cell');
    expect(cells.slice(3).map((c) => c.textContent?.trim())).toEqual([
      '1',
      '1',
      '1',
    ]);
  });

  it('should load role-specific settings', async () => {
    const { mocks } = await setup({ entries: [E1] });

    expect(mocks.appRepository.getSettingFor).toHaveBeenCalledWith(
      COD_HANDS_PART_TYPEID,
      undefined,
    );
  });
});

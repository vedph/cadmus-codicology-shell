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
  COD_LAYOUTS_PART_TYPEID,
  CodLayout,
  CodLayoutsPart,
} from '../cod-layouts-part';
import { CodLayoutsPartComponent } from './cod-layouts-part.component';

describe('CodLayoutsPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_LAYOUTS_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };
  const E1: CodLayout = { sample: { n: 11 }, ranges: [{ start: { n: 10 }, end: { n: 20 } }], columnCount: 2 };
  const E2: CodLayout = { ranges: [{ start: { n: 30 }, end: { n: 40 } }], columnCount: 1 };
  const THESAURI: ThesauriSet = {};

  async function setup(options?: {
    entries?: CodLayout[];
    thesauri?: ThesauriSet;
    roles?: string[];
    confirm?: boolean;
    settings?: any;
    extra?: Partial<CodLayoutsPart>;
  }) {
    const mocks = createEditorMocks(options);
    const data = signal<EditedObject<CodLayoutsPart> | undefined>(
      buildEditedPart(
        options?.entries
          ? buildPart<CodLayoutsPart>(COD_LAYOUTS_PART_TYPEID, {
              layouts: options.entries,
              ...options.extra,
            })
          : undefined,
        options?.thesauri ?? THESAURI,
      ),
    );
    const editorClose = vi.fn();
    const result = await render(CodLayoutsPartComponent, {
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
  // the layout editor also contains the formula editor with its own
  // accept/discard buttons: scope to the layout editor's form
  const entryForm = () =>
    screen.getByRole('textbox', { name: /^note/ }).closest('form')!;
  const acceptEntry = () =>
    within(entryForm())
      .getAllByRole('button', { description: /accept changes/i })
      .at(-1)!;
  const discardEntry = () =>
    within(entryForm())
      .getAllByRole('button', { description: /discard changes/i })
      .at(-1)!;

  it('should show the default title', async () => {
    await setup();
    expect(screen.getByText('Manuscript Layouts Part')).toBeInTheDocument();
  });

  it('should list layouts', async () => {
    await setup({ entries: [E1, E2] });

    expect(rows()).toHaveLength(2);
    expect(within(rows()[0]).getByText('10-20')).toBeInTheDocument();
    expect(within(rows()[1]).getByText('30-40')).toBeInTheDocument();
  });

  it('should not allow saving without layouts', async () => {
    await setup();
    expect(partSaveButton()).toBeDisabled();
  });

  it('should hide save for users below operator level', async () => {
    await setup({ entries: [E1], roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should add a layout and save the part', async () => {
    const { user, data } = await setup();

    await user.click(screen.getByRole('button', { name: /^layout$/ }));
    expect(screen.getByRole('textbox', { name: /^note/ })).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /^range/ }), '5r');
    // let the location editor emit its debounced change
    await new Promise((r) => setTimeout(r, 350));
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.queryByRole('textbox', { name: /^note/ })).toBeNull();

    await user.click(partSaveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_LAYOUTS_PART_TYPEID);
    expect(part.layouts).toHaveLength(1);
    expect(part.layouts[0]).toEqual(expect.objectContaining({ ranges: [expect.anything()], columnCount: 0 }));
  });

  it('should edit an existing layout', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this layout/i));
    expect(screen.getByRole('textbox', { name: /^range/ })).toHaveValue('30-40');

    await user.type(screen.getByRole('textbox', { name: /^note/ }), ' x ');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());
    await user.click(partSaveButton());

    expect(data()!.value!.layouts[1]).toEqual(
      expect.objectContaining({ columnCount: 1, note: 'x' }),
    );
    expect(data()!.value!.layouts[0]).toEqual(E1);
  });

  it('should not save the part when accepting a layout', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this layout/i));
    await user.type(screen.getByRole('textbox', { name: /^note/ }), ' x ');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    // the part is saved only via its own save button
    expect(data()!.value!.layouts).toEqual([E1, E2]);
  });

  it('should close the layout editor on cancel', async () => {
    const { user, data } = await setup({ entries: [E1] });

    await user.click(rowButton(0, /edit this layout/i));
    await user.click(discardEntry());

    expect(screen.queryByRole('textbox', { name: /^note/ })).toBeNull();
    expect(data()!.value!.layouts).toEqual([E1]);
  });

  it('should delete a layout after confirmation', async () => {
    const { user, mocks } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(0, /delete this layout/i));

    expect(mocks.dialog.confirm).toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
    expect(within(rows()[0]).getByText('30-40')).toBeInTheDocument();
  });

  it('should not delete a layout when not confirmed', async () => {
    const { user } = await setup({ entries: [E1, E2], confirm: false });

    await user.click(rowButton(0, /delete this layout/i));

    expect(rows()).toHaveLength(2);
  });

  it('should move layouts up and down', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    expect(rowButton(0, /move this layout up/i)).toBeDisabled();
    expect(rowButton(1, /move this layout down/i)).toBeDisabled();

    await user.click(rowButton(0, /move this layout down/i));
    expect(within(rows()[0]).getByText('30-40')).toBeInTheDocument();
    await user.click(partSaveButton());
    expect(data()!.value!.layouts).toEqual([E2, E1]);

    await user.click(rowButton(1, /move this layout up/i));
    expect(within(rows()[0]).getByText('10-20')).toBeInTheDocument();
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ entries: [E1] });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });

  it('should show sample and column count in the list', async () => {
    await setup({ entries: [E1] });

    expect(within(rows()[0]).getByText('11')).toBeInTheDocument();
    expect(within(rows()[0]).getByText('2')).toBeInTheDocument();
  });
});

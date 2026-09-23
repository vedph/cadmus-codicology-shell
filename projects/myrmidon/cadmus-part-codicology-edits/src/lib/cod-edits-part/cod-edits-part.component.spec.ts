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
  COD_EDITS_PART_TYPEID,
  CodEdit,
  CodEditsPart,
} from '../cod-edits-part';
import { CodEditsPartComponent } from './cod-edits-part.component';

describe('CodEditsPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_EDITS_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };
  const E1: CodEdit = { type: 'gloss', ranges: [{ start: { n: 1 }, end: { n: 2 } }], text: 'hello' };
  const E2: CodEdit = { type: 'corr', ranges: [{ start: { n: 3 }, end: { n: 3 } }] };
  const THESAURI: ThesauriSet = buildThesauri({
    'cod-edit-types': [
      { id: 'gloss', value: 'Gloss' },
      { id: 'corr', value: 'Correction' },
    ],
  });

  async function setup(options?: {
    entries?: CodEdit[];
    thesauri?: ThesauriSet;
    roles?: string[];
    confirm?: boolean;
    settings?: any;
    extra?: Partial<CodEditsPart>;
  }) {
    const mocks = createEditorMocks(options);
    const data = signal<EditedObject<CodEditsPart> | undefined>(
      buildEditedPart(
        options?.entries
          ? buildPart<CodEditsPart>(COD_EDITS_PART_TYPEID, {
              edits: options.entries,
              ...options.extra,
            })
          : undefined,
        options?.thesauri ?? THESAURI,
      ),
    );
    const editorClose = vi.fn();
    const result = await render(CodEditsPartComponent, {
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
  const acceptEntry = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;
  const discardEntry = () =>
    screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!;

  it('should show the default title', async () => {
    await setup();
    expect(screen.getByText('Manuscript Edits Part')).toBeInTheDocument();
  });

  it('should list edits', async () => {
    await setup({ entries: [E1, E2] });

    expect(rows()).toHaveLength(2);
    expect(within(rows()[0]).getByText('Gloss')).toBeInTheDocument();
    expect(within(rows()[1]).getByText('Correction')).toBeInTheDocument();
  });

  it('should not allow saving without edits', async () => {
    await setup();
    expect(partSaveButton()).toBeDisabled();
  });

  it('should hide save for users below operator level', async () => {
    await setup({ entries: [E1], roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should add a edit and save the part', async () => {
    const { user, data } = await setup();

    await user.click(screen.getByRole('button', { name: /^edit$/ }));
    expect(screen.getByText(/#0/)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /^ranges/ }), '5r');
    // let the location editor emit its debounced change
    await new Promise((r) => setTimeout(r, 350));
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.queryByText(/#0/)).toBeNull();

    await user.click(partSaveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_EDITS_PART_TYPEID);
    expect(part.edits).toHaveLength(1);
    expect(part.edits[0]).toEqual(expect.objectContaining({ type: 'gloss', ranges: [expect.anything()] }));
  });

  it('should edit an existing edit', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this edit/i));
    expect(screen.getByText(/#2/)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /^text/ }), ' x ');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());
    await user.click(partSaveButton());

    expect(data()!.value!.edits[1]).toEqual(
      expect.objectContaining({ type: 'corr', text: 'x' }),
    );
    expect(data()!.value!.edits[0]).toEqual(E1);
  });

  it('should not save the part when accepting a edit', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this edit/i));
    await user.type(screen.getByRole('textbox', { name: /^text/ }), ' x ');
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    // the part is saved only via its own save button
    expect(data()!.value!.edits).toEqual([E1, E2]);
  });

  it('should close the edit editor on cancel', async () => {
    const { user, data } = await setup({ entries: [E1] });

    await user.click(rowButton(0, /edit this edit/i));
    await user.click(discardEntry());

    expect(screen.queryByText(/#1/)).toBeNull();
    expect(data()!.value!.edits).toEqual([E1]);
  });

  it('should delete a edit after confirmation', async () => {
    const { user, mocks } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(0, /delete this edit/i));

    expect(mocks.dialog.confirm).toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
    expect(within(rows()[0]).getByText('Correction')).toBeInTheDocument();
  });

  it('should not delete a edit when not confirmed', async () => {
    const { user } = await setup({ entries: [E1, E2], confirm: false });

    await user.click(rowButton(0, /delete this edit/i));

    expect(rows()).toHaveLength(2);
  });

  it('should move edits up and down', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    expect(rowButton(0, /move this edit up/i)).toBeDisabled();
    expect(rowButton(1, /move this edit down/i)).toBeDisabled();

    await user.click(rowButton(0, /move this edit down/i));
    expect(within(rows()[0]).getByText('Correction')).toBeInTheDocument();
    await user.click(partSaveButton());
    expect(data()!.value!.edits).toEqual([E2, E1]);

    await user.click(rowButton(1, /move this edit up/i));
    expect(within(rows()[0]).getByText('Gloss')).toBeInTheDocument();
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ entries: [E1] });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });

  it('should show ranges and text in the list', async () => {
    await setup({ entries: [E1] });

    expect(within(rows()[0]).getByText('hello')).toBeInTheDocument();
    expect(within(rows()[0]).getByText(/1.*2/)).toBeInTheDocument();
  });

  it('should load role-specific settings', async () => {
    const { mocks } = await setup({ entries: [E1] });

    expect(mocks.appRepository.getSettingFor).toHaveBeenCalledWith(
      COD_EDITS_PART_TYPEID,
      undefined,
    );
  });
});

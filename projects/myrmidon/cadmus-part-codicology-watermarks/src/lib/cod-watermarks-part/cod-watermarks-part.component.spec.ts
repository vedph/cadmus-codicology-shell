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
  COD_WATERMARKS_PART_TYPEID,
  CodWatermark,
  CodWatermarksPart,
} from '../cod-watermarks-part';
import { CodWatermarksPartComponent } from './cod-watermarks-part.component';

describe('CodWatermarksPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_WATERMARKS_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };
  const E1: CodWatermark = { name: 'crown', description: 'a crown', chronotopes: [{ place: { value: 'Fabriano' } }] };
  const E2: CodWatermark = { name: 'anchor' };
  const THESAURI: ThesauriSet = {};

  async function setup(options?: {
    entries?: CodWatermark[];
    thesauri?: ThesauriSet;
    roles?: string[];
    confirm?: boolean;
    settings?: any;
    extra?: Partial<CodWatermarksPart>;
  }) {
    const mocks = createEditorMocks(options);
    const data = signal<EditedObject<CodWatermarksPart> | undefined>(
      buildEditedPart(
        options?.entries
          ? buildPart<CodWatermarksPart>(COD_WATERMARKS_PART_TYPEID, {
              watermarks: options.entries,
              ...options.extra,
            })
          : undefined,
        options?.thesauri ?? THESAURI,
      ),
    );
    const editorClose = vi.fn();
    const result = await render(CodWatermarksPartComponent, {
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
    expect(screen.getByText('Watermarks Part')).toBeInTheDocument();
  });

  it('should list watermarks', async () => {
    await setup({ entries: [E1, E2] });

    expect(rows()).toHaveLength(2);
    expect(within(rows()[0]).getByText('crown')).toBeInTheDocument();
    expect(within(rows()[1]).getByText('anchor')).toBeInTheDocument();
  });

  it('should not allow saving without watermarks', async () => {
    await setup();
    expect(partSaveButton()).toBeDisabled();
  });

  it('should hide save for users below operator level', async () => {
    await setup({ entries: [E1], roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should add a watermark and save the part', async () => {
    const { user, data } = await setup();

    await user.click(screen.getByRole('button', { name: /^watermark$/ }));
    expect(screen.getByText(/#0/)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /^name/ }), ' star ');
    await user.type(screen.getByRole('textbox', { name: /^ranges/ }), '1r-2v');
    // let the location editor emit its debounced change
    await new Promise((r) => setTimeout(r, 350));
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.queryByText(/#0/)).toBeNull();

    await user.click(partSaveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_WATERMARKS_PART_TYPEID);
    expect(part.watermarks).toHaveLength(1);
    expect(part.watermarks[0]).toEqual(expect.objectContaining({ name: 'star', ranges: [expect.anything()] }));
  });

  it('should edit an existing watermark', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this watermark/i));
    expect(screen.getByText(/#2/)).toBeInTheDocument();

    await user.type(
      screen.getByRole('textbox', { name: /^description/ }),
      'x',
    );
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());
    await user.click(partSaveButton());

    expect(data()!.value!.watermarks[1]).toEqual(
      expect.objectContaining({ name: 'anchor', description: 'x' }),
    );
    expect(data()!.value!.watermarks[0]).toEqual(E1);
  });

  it('should not save the part when accepting a watermark', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this watermark/i));
    await user.type(
      screen.getByRole('textbox', { name: /^description/ }),
      'x',
    );
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    // the part is saved only via its own save button
    expect(data()!.value!.watermarks).toEqual([E1, E2]);
  });

  it('should close the watermark editor on cancel', async () => {
    const { user, data } = await setup({ entries: [E1] });

    await user.click(rowButton(0, /edit this watermark/i));
    await user.click(discardEntry());

    expect(screen.queryByText(/#1/)).toBeNull();
    expect(data()!.value!.watermarks).toEqual([E1]);
  });

  it('should delete a watermark after confirmation', async () => {
    const { user, mocks } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(0, /delete this watermark/i));

    expect(mocks.dialog.confirm).toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
    expect(within(rows()[0]).getByText('anchor')).toBeInTheDocument();
  });

  it('should not delete a watermark when not confirmed', async () => {
    const { user } = await setup({ entries: [E1, E2], confirm: false });

    await user.click(rowButton(0, /delete this watermark/i));

    expect(rows()).toHaveLength(2);
  });

  it('should move watermarks up and down', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    expect(rowButton(0, /move this watermark up/i)).toBeDisabled();
    expect(rowButton(1, /move this watermark down/i)).toBeDisabled();

    await user.click(rowButton(0, /move this watermark down/i));
    expect(within(rows()[0]).getByText('anchor')).toBeInTheDocument();
    await user.click(partSaveButton());
    expect(data()!.value!.watermarks).toEqual([E2, E1]);

    await user.click(rowButton(1, /move this watermark up/i));
    expect(within(rows()[0]).getByText('crown')).toBeInTheDocument();
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ entries: [E1] });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });

  it('should show the chronotopes count', async () => {
    await setup({ entries: [E1, E2] });

    expect(within(rows()[0]).getByText('1')).toBeInTheDocument();
    expect(within(rows()[1]).getByText('0')).toBeInTheDocument();
  });

  it('should load role-specific settings', async () => {
    const { mocks } = await setup({ entries: [E1] });

    expect(mocks.appRepository.getSettingFor).toHaveBeenCalledWith(
      COD_WATERMARKS_PART_TYPEID,
      undefined,
    );
  });
});

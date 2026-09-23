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
  COD_SHELFMARKS_PART_TYPEID,
  CodShelfmark,
  CodShelfmarksPart,
} from '../cod-shelfmarks-part';
import { CodShelfmarksPartComponent } from './cod-shelfmarks-part.component';

describe('CodShelfmarksPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_SHELFMARKS_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };
  const S1: CodShelfmark = {
    city: 've',
    library: 'marc',
    fund: 'Lat.',
    location: 'Z 1',
  };
  const S2: CodShelfmark = {
    city: 'fi',
    library: 'bncf',
    location: 'Magl. 2',
  };
  const THESAURI = buildThesauri({
    'cod-shelfmark-cities': [
      { id: 've', value: 'Venice' },
      { id: 'fi', value: 'Florence' },
    ],
    'cod-shelfmark-libraries': [
      { id: 'marc', value: 'Marciana (Venice)' },
      { id: 'bncf', value: 'Nazionale (Florence)' },
    ],
  });

  async function setup(options?: {
    shelfmarks?: CodShelfmark[];
    thesauri?: ThesauriSet;
    roles?: string[];
    confirm?: boolean;
    settings?: any;
  }) {
    const mocks = createEditorMocks(options);
    const data = signal<EditedObject<CodShelfmarksPart> | undefined>(
      buildEditedPart(
        options?.shelfmarks
          ? buildPart<CodShelfmarksPart>(COD_SHELFMARKS_PART_TYPEID, {
              shelfmarks: options.shelfmarks,
            })
          : undefined,
        options?.thesauri ?? THESAURI,
      ),
    );
    const editorClose = vi.fn();
    const dirtyChange = vi.fn();
    const result = await render(CodShelfmarksPartComponent, {
      bindings: [
        inputBinding('identity', () => IDENTITY),
        twoWayBinding('data', data),
        outputBinding('editorClose', editorClose),
        outputBinding('dirtyChange', dirtyChange),
      ],
      providers: provideEditorMocks(mocks),
    });
    return {
      ...result,
      data,
      mocks,
      editorClose,
      dirtyChange,
      user: userEvent.setup(),
    };
  }

  const rows = () => screen.queryAllByRole('row').slice(1);
  const partSaveButton = () => screen.getByRole('button', { name: /save/ });
  const rowButton = (row: number, description: RegExp) =>
    within(rows()[row]).getByRole('button', { description });

  it('should show the default title', async () => {
    await setup();
    expect(screen.getByText('Shelfmarks Part')).toBeInTheDocument();
  });

  it('should list shelfmarks with thesaurus values', async () => {
    await setup({ shelfmarks: [S1, S2] });

    expect(rows()).toHaveLength(2);
    expect(within(rows()[0]).getByText('Venice')).toBeInTheDocument();
    expect(
      within(rows()[0]).getByText('Marciana (Venice)'),
    ).toBeInTheDocument();
    expect(within(rows()[0]).getByText('Lat.')).toBeInTheDocument();
    expect(within(rows()[1]).getByText('Magl. 2')).toBeInTheDocument();
  });

  it('should not allow saving without shelfmarks', async () => {
    await setup();
    expect(partSaveButton()).toBeDisabled();
  });

  it('should hide save for users below operator level', async () => {
    await setup({ shelfmarks: [S1], roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should add a shelfmark and save the part', async () => {
    const { user, data } = await setup({ thesauri: {} });

    await user.click(screen.getByRole('button', { name: /shelfmark/ }));
    expect(screen.getByText('#0')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /city/ }), 'Rome');
    await user.type(screen.getByRole('textbox', { name: /library/ }), 'BAV');
    await user.type(
      screen.getByRole('textbox', { name: /location/ }),
      'Vat. lat. 1',
    );
    await user.click(
      screen.getByRole('button', { description: /accept changes/i }),
    );

    expect(rows()).toHaveLength(1);
    expect(screen.queryByText('#0')).toBeNull();

    await user.click(partSaveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_SHELFMARKS_PART_TYPEID);
    expect(part.itemId).toBe('item1');
    expect(part.shelfmarks).toEqual([
      {
        tag: undefined,
        city: 'Rome',
        library: 'BAV',
        fund: undefined,
        location: 'Vat. lat. 1',
      },
    ]);
  });

  it('should edit an existing shelfmark', async () => {
    const { user, data } = await setup({ shelfmarks: [S1, S2] });

    await user.click(rowButton(1, /edit this shelfmark/i));
    expect(screen.getByText('#2')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /fund/ }), 'Magl.');
    await user.click(
      screen.getByRole('button', { description: /accept changes/i }),
    );
    await user.click(partSaveButton());

    expect(data()!.value!.shelfmarks[1]).toEqual(
      expect.objectContaining({ fund: 'Magl.', library: 'bncf' }),
    );
    expect(data()!.value!.shelfmarks[0]).toEqual(S1);
  });

  it('should default a new shelfmark to the first city and library', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: /shelfmark/ }));

    const city = screen.getByRole('combobox', { name: /city/ });
    await waitFor(() => expect(city).toHaveTextContent('Venice'));
    expect(screen.getByRole('combobox', { name: /library/ })).toHaveTextContent(
      'Marciana (Venice)',
    );
  });

  it('should not save the part when accepting a shelfmark', async () => {
    const { user, data } = await setup({ shelfmarks: [S1, S2] });

    await user.click(rowButton(1, /edit this shelfmark/i));
    await user.type(screen.getByRole('textbox', { name: /fund/ }), 'x');
    await user.click(
      screen.getByRole('button', { description: /accept changes/i }),
    );

    expect(data()!.value!.shelfmarks).toEqual([S1, S2]);
  });

  it('should become dirty when shelfmarks are moved', async () => {
    const { user, dirtyChange } = await setup({ shelfmarks: [S1, S2] });

    await user.click(rowButton(0, /move this shelfmark down/i));

    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should become dirty when a shelfmark is deleted', async () => {
    const { user, dirtyChange } = await setup({ shelfmarks: [S1, S2] });

    await user.click(rowButton(0, /delete this shelfmark/i));

    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should close the shelfmark editor on cancel', async () => {
    const { user } = await setup({ shelfmarks: [S1] });

    await user.click(rowButton(0, /edit this shelfmark/i));
    await user.click(
      screen.getByRole('button', { description: /discard changes/i }),
    );

    expect(screen.queryByText('#1')).toBeNull();
  });

  it('should delete a shelfmark after confirmation', async () => {
    const { user, mocks } = await setup({ shelfmarks: [S1, S2] });

    await user.click(rowButton(0, /delete this shelfmark/i));

    expect(mocks.dialog.confirm).toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
    expect(within(rows()[0]).getByText('Florence')).toBeInTheDocument();
  });

  it('should not delete a shelfmark when not confirmed', async () => {
    const { user } = await setup({ shelfmarks: [S1, S2], confirm: false });

    await user.click(rowButton(0, /delete this shelfmark/i));

    expect(rows()).toHaveLength(2);
  });

  it('should move shelfmarks up and down', async () => {
    const { user } = await setup({ shelfmarks: [S1, S2] });

    expect(rowButton(0, /move this shelfmark up/i)).toBeDisabled();
    expect(rowButton(1, /move this shelfmark down/i)).toBeDisabled();

    await user.click(rowButton(0, /move this shelfmark down/i));
    expect(within(rows()[0]).getByText('Florence')).toBeInTheDocument();

    await user.click(rowButton(1, /move this shelfmark up/i));
    expect(within(rows()[0]).getByText('Venice')).toBeInTheDocument();
  });

  it('should pass the city pattern from settings to the editor', async () => {
    const { user, mocks } = await setup({
      shelfmarks: [S1],
      settings: { cityFromLibPattern: '\\(([^)]+)\\)$' },
      thesauri: buildThesauri({
        'cod-shelfmark-libraries': [{ id: 'marc', value: 'Marciana (Venice)' }],
      }),
    });

    await user.click(rowButton(0, /edit this shelfmark/i));

    expect(mocks.appRepository.getSettingFor).toHaveBeenCalledWith(
      COD_SHELFMARKS_PART_TYPEID,
      undefined,
    );
    const city = screen.getByRole('textbox', { name: /city/ });
    expect(city).toBeDisabled();
    expect(city).toHaveValue('Venice');
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ shelfmarks: [S1] });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });
});

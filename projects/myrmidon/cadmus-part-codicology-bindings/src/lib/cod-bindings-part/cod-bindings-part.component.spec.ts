import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, within } from '@testing-library/angular';
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
  COD_BINDINGS_PART_TYPEID,
  CodBinding,
  CodBindingsPart,
} from '../cod-bindings-part';
import { CodBindingsPartComponent } from './cod-bindings-part.component';

describe('CodBindingsPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_BINDINGS_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };
  const B1: CodBinding = {
    tag: 't1',
    coverMaterial: 'leather',
    boardMaterial: 'wood',
    chronotope: { place: { value: 'Rome' } },
  };
  const B2: CodBinding = {
    coverMaterial: 'paper',
    boardMaterial: 'card',
    chronotope: { place: { value: 'Milan' } },
  };
  const THESAURI = buildThesauri({
    'cod-binding-cover-materials': [
      { id: 'leather', value: 'Leather' },
      { id: 'paper', value: 'Paper' },
    ],
    'cod-binding-board-materials': [
      { id: 'wood', value: 'Wood' },
      { id: 'card', value: 'Cardboard' },
    ],
  });

  async function setup(options?: {
    bindings?: CodBinding[];
    thesauri?: ThesauriSet;
    roles?: string[];
    confirm?: boolean;
  }) {
    const mocks = createEditorMocks({
      roles: options?.roles,
      confirm: options?.confirm,
    });
    const data = signal<EditedObject<CodBindingsPart> | undefined>(
      buildEditedPart(
        options?.bindings
          ? buildPart<CodBindingsPart>(COD_BINDINGS_PART_TYPEID, {
              bindings: options.bindings,
            })
          : undefined,
        options?.thesauri ?? THESAURI,
      ),
    );
    const editorClose = vi.fn();
    const result = await render(CodBindingsPartComponent, {
      bindings: [
        inputBinding('identity', () => IDENTITY),
        twoWayBinding('data', data),
        outputBinding('editorClose', editorClose),
      ],
      providers: provideEditorMocks(mocks),
    });
    return { ...result, data, mocks, editorClose, user: userEvent.setup() };
  }

  const rows = () => screen.queryAllByRole('row').slice(1);
  const partSaveButton = () => screen.getByRole('button', { name: /save/ });

  it('should show the default title', async () => {
    await setup();
    expect(screen.getByText('Bindings Part')).toBeInTheDocument();
  });

  it('should list bindings with thesaurus values', async () => {
    await setup({ bindings: [B1, B2] });

    expect(rows()).toHaveLength(2);
    expect(within(rows()[0]).getByText('Leather')).toBeInTheDocument();
    expect(within(rows()[0]).getByText('Wood')).toBeInTheDocument();
    expect(within(rows()[0]).getByText('Rome')).toBeInTheDocument();
    expect(within(rows()[1]).getByText('Cardboard')).toBeInTheDocument();
  });

  it('should not allow saving without bindings', async () => {
    await setup();

    expect(rows()).toHaveLength(0);
    expect(partSaveButton()).toBeDisabled();
  });

  it('should hide save for users below operator level', async () => {
    await setup({ bindings: [B1], roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should add a binding and save the part', async () => {
    const { user, data } = await setup();

    await user.click(screen.getByRole('button', { name: /binding/ }));
    // new binding editor defaults to first cover/board entries
    expect(screen.getByText('#0')).toBeInTheDocument();
    const cover = screen.getByRole('combobox', { name: /cover/ });
    expect(cover).toBeInTheDocument();

    // make the new binding dirty and accept it
    await user.type(screen.getByRole('textbox', { name: /description/ }), 'x');
    await user.click(
      screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
    );

    expect(rows()).toHaveLength(1);
    expect(within(rows()[0]).getByText('Leather')).toBeInTheDocument();
    expect(screen.queryByText('#0')).toBeNull();

    await user.click(partSaveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_BINDINGS_PART_TYPEID);
    expect(part.bindings).toHaveLength(1);
    expect(part.bindings[0]).toEqual(
      expect.objectContaining({
        coverMaterial: 'leather',
        boardMaterial: 'wood',
        description: 'x',
      }),
    );
  });

  it('should edit an existing binding', async () => {
    const { user, data } = await setup({ bindings: [B1, B2] });

    await user.click(
      within(rows()[1]).getByRole('button', {
        description: /edit this binding/i,
      }),
    );
    expect(screen.getByText('#2')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /description/ }), 'd');
    await user.click(
      screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
    );
    await user.click(partSaveButton());

    expect(data()!.value!.bindings[1].description).toBe('d');
    expect(data()!.value!.bindings[0]).toEqual(B1);
  });

  it('should not save the part when accepting a binding', async () => {
    const { user, data } = await setup({ bindings: [B1, B2] });

    await user.click(
      within(rows()[1]).getByRole('button', {
        description: /edit this binding/i,
      }),
    );
    await user.type(screen.getByRole('textbox', { name: /description/ }), 'd');
    await user.click(
      screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
    );

    // the part is saved only via its own save button
    expect(data()!.value!.bindings).toEqual([B1, B2]);
  });

  it('should close the binding editor on cancel', async () => {
    const { user } = await setup({ bindings: [B1] });

    await user.click(
      screen.getByRole('button', { description: /edit this binding/i }),
    );
    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(screen.queryByText('#1')).toBeNull();
  });

  it('should delete a binding after confirmation', async () => {
    const { user, mocks } = await setup({ bindings: [B1, B2] });

    await user.click(
      within(rows()[0]).getByRole('button', {
        description: /delete this binding/i,
      }),
    );

    expect(mocks.dialog.confirm).toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
    expect(within(rows()[0]).getByText('Paper')).toBeInTheDocument();
  });

  it('should not delete a binding when not confirmed', async () => {
    const { user } = await setup({ bindings: [B1, B2], confirm: false });

    await user.click(
      within(rows()[0]).getByRole('button', {
        description: /delete this binding/i,
      }),
    );

    expect(rows()).toHaveLength(2);
  });

  it('should move bindings up and down', async () => {
    const { user } = await setup({ bindings: [B1, B2] });

    expect(
      within(rows()[0]).getByRole('button', {
        description: /move this binding up/i,
      }),
    ).toBeDisabled();

    await user.click(
      within(rows()[0]).getByRole('button', {
        description: /move this binding down/i,
      }),
    );
    expect(within(rows()[0]).getByText('Paper')).toBeInTheDocument();

    await user.click(
      within(rows()[1]).getByRole('button', {
        description: /move this binding up/i,
      }),
    );
    expect(within(rows()[0]).getByText('Leather')).toBeInTheDocument();
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ bindings: [B1] });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });

  it('should load role-specific settings', async () => {
    const { mocks } = await setup({ bindings: [B1] });

    expect(mocks.appRepository.getSettingFor).toHaveBeenCalledWith(
      COD_BINDINGS_PART_TYPEID,
      undefined,
    );
  });
});

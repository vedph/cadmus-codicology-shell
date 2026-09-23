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
  provideRefsMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_SHEET_LABELS_PART_TYPEID,
  CodEndleaf,
  CodRow,
  CodSheetLabelsPart,
} from '../cod-sheet-labels-part';
import { CodSheetLabelsPartComponent } from './cod-sheet-labels-part.component';

type User = ReturnType<typeof userEvent.setup>;

describe('CodSheetLabelsPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_SHEET_LABELS_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };
  const ROWS: CodRow[] = [
    {
      id: '(1r)',
      columns: [
        { id: 'q', value: '' },
        { id: 'n', value: '' },
      ],
    },
    {
      id: '(1v)',
      columns: [
        { id: 'q', value: '' },
        { id: 'n', value: '' },
      ],
    },
    {
      id: '1r',
      columns: [
        { id: 'q', value: '1.1/1' },
        { id: 'n', value: 'i' },
      ],
    },
    {
      id: '1v',
      columns: [
        { id: 'q', value: '1.1/1' },
        { id: 'n', value: 'ii', note: 'a note' },
      ],
    },
  ];
  const E1: CodEndleaf = { location: '(1)', material: 'paper' };
  const E2: CodEndleaf = { location: '(1)', material: 'parch' };
  const THESAURI = buildThesauri({
    'cod-endleaf-materials': [
      { id: 'paper', value: 'Paper' },
      { id: 'parch', value: 'Parchment' },
    ],
  });

  async function setup(options?: {
    part?: Partial<CodSheetLabelsPart>;
    thesauri?: ThesauriSet;
    roles?: string[];
    confirm?: boolean;
  }) {
    const mocks = createEditorMocks(options);
    const data = signal<EditedObject<CodSheetLabelsPart> | undefined>(
      buildEditedPart(
        options?.part
          ? buildPart<CodSheetLabelsPart>(COD_SHEET_LABELS_PART_TYPEID, {
              rows: [],
              ...options.part,
            })
          : undefined,
        options?.thesauri ?? THESAURI,
      ),
    );
    const editorClose = vi.fn();
    const dirtyChange = vi.fn();
    const result = await render(CodSheetLabelsPartComponent, {
      bindings: [
        inputBinding('identity', () => IDENTITY),
        twoWayBinding('data', data),
        outputBinding('editorClose', editorClose),
        outputBinding('dirtyChange', dirtyChange),
      ],
      providers: [...provideEditorMocks(mocks), ...provideRefsMocks()],
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

  // the labels table is the only table in the labels tab
  const headerIds = () =>
    within(screen.getAllByRole('rowgroup')[0])
      .getAllByRole('columnheader')
      .map((h) => h.textContent?.trim())
      .slice(1);
  const bodyRows = () =>
    screen.queryAllByRole('rowgroup')[1]
      ? within(screen.getAllByRole('rowgroup')[1]).queryAllByRole('row')
      : [];
  const rowIds = () =>
    bodyRows().map((r) => r.firstElementChild?.textContent?.trim());
  const partSaveButton = () => screen.getByRole('button', { name: /save/ });

  async function pickOption(user: User, combo: RegExp, option: string) {
    await user.click(screen.getByRole('combobox', { name: combo }));
    await user.click(await screen.findByRole('option', { name: option }));
  }

  async function add(user: User, type: string, nameOrCount?: string) {
    await pickOption(user, /^type/, type);
    if (nameOrCount !== undefined) {
      const name = screen.queryByRole('textbox', { name: /^name/ });
      if (name) {
        await user.type(name, nameOrCount);
      } else {
        const count = screen.getByRole('spinbutton', { name: /count/ });
        await user.clear(count);
        await user.type(count, nameOrCount);
      }
    }
    await user.click(
      screen.getByRole('button', {
        description: /add the selected table element/i,
      }),
    );
  }

  async function runAction(user: User, column: string, action: string) {
    await pickOption(user, /^column/, column);
    const input = screen.getByRole('textbox', { name: /^action/ });
    await user.clear(input);
    await user.type(input, action.replace(/[[{]/g, '$&$&'));
    await user.click(
      screen.getByRole('button', { description: /execute this action/i }),
    );
  }

  it('should show the default title and tabs', async () => {
    await setup();

    expect(screen.getByText('Sheet Labels Part')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'labels' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'endleaves' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'help' })).toBeInTheDocument();
  });

  it('should show the labels table', async () => {
    await setup({ part: { rows: ROWS } });

    expect(headerIds()).toEqual(['q', 'n']);
    expect(rowIds()).toEqual(['(1r)', '(1v)', '1r', '1v']);
    expect(within(bodyRows()[3]).getByText('ii')).toBeInTheDocument();
  });

  it('should add body rows', async () => {
    const { user } = await setup({ part: { rows: [] } });

    await add(user, 'body', '2');

    // 2 sheets = 4 pages
    expect(rowIds()).toEqual(['1r', '1v', '2r', '2v']);
  });

  it('should add columns', async () => {
    const { user } = await setup({ part: { rows: [] } });

    await add(user, 'body', '1');
    await add(user, 'quire');
    await add(user, 'numbering', 'roman');

    expect(headerIds()).toEqual(['q', 'n.roman']);
    // the added column becomes the action column
    expect(
      screen.getByRole('combobox', { name: /^column/ }),
    ).toHaveTextContent('n.roman');
    // the quire column is unique
    await user.click(screen.getByRole('combobox', { name: /^type/ }));
    expect(screen.queryByRole('option', { name: 'quire' })).toBeNull();
  });

  it('should generate labels with an action', async () => {
    const { user } = await setup({ part: { rows: [] } });
    await add(user, 'body', '1');
    await add(user, 'numbering');
    // without auto-append, labels overflowing the table would be dropped
    await user.click(screen.getByRole('checkbox', { name: /auto-append/ }));

    await runAction(user, 'n', '1r%3=1');

    expect(rowIds()).toEqual(['1r', '1v', '2r']);
    expect(within(bodyRows()[2]).getByText('3')).toBeInTheDocument();
  });

  it('should set labels with a set action', async () => {
    const { user } = await setup({ part: { rows: ROWS } });

    await runAction(user, 'n', '1r 1v:=x');

    expect(within(bodyRows()[2]).getByText('x')).toBeInTheDocument();
  });

  it('should reject an invalid action', async () => {
    const { user } = await setup({ part: { rows: ROWS } });

    await pickOption(user, /^column/, 'n');
    await user.type(screen.getByRole('textbox', { name: /^action/ }), 'bad');
    await user.tab();

    expect(screen.getByText('invalid action')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { description: /execute this action/i }),
    ).toBeDisabled();
  });

  it('should clear a column after confirmation', async () => {
    const { user, mocks } = await setup({ part: { rows: ROWS } });

    await pickOption(user, /^column/, 'n');
    await user.click(
      screen.getByRole('button', { description: /clear the selected column/i }),
    );

    expect(mocks.dialog.confirm).toHaveBeenCalled();
    expect(screen.queryByText('ii')).toBeNull();
    expect(headerIds()).toEqual(['q', 'n']);
  });

  it('should delete a column after confirmation', async () => {
    const { user } = await setup({ part: { rows: ROWS } });

    await pickOption(user, /^column/, 'n');
    await user.click(
      screen.getByRole('button', {
        description: /delete the selected column/i,
      }),
    );

    expect(headerIds()).toEqual(['q']);
  });

  it('should not delete a column when not confirmed', async () => {
    const { user } = await setup({ part: { rows: ROWS }, confirm: false });

    await pickOption(user, /^column/, 'n');
    await user.click(
      screen.getByRole('button', {
        description: /delete the selected column/i,
      }),
    );

    expect(headerIds()).toEqual(['q', 'n']);
  });

  it('should trim empty rows', async () => {
    const { user } = await setup({ part: { rows: ROWS } });

    await user.click(
      screen.getByRole('button', { description: /^trim table rows$/i }),
    );

    expect(rowIds()).toEqual(['1r', '1v']);
  });

  it('should edit a cell value', async () => {
    const { user, data } = await setup({ part: { rows: ROWS } });

    await user.click(
      within(bodyRows()[2]).getAllByRole('button', {
        description: /edit value/i,
      })[1],
    );
    const input = screen.getByRole('textbox', { name: /^value/ });
    await user.clear(input);
    await user.type(input, 'I');
    await user.click(screen.getByRole('button', { description: /save edit/i }));
    await user.click(partSaveButton());

    const row = data()!.value!.rows.find((r) => r.id === '1r')!;
    expect(row.columns.find((c) => c.id === 'n')!.value).toBe('I');
  });

  it('should become dirty when editing the table', async () => {
    const { user, dirtyChange } = await setup({ part: { rows: ROWS } });
    expect(dirtyChange).not.toHaveBeenCalledWith(true);

    await runAction(user, 'n', '1r 1v:=x');

    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should not save the part when adding rows or running actions', async () => {
    const { user, data } = await setup({ part: { rows: ROWS } });
    const saved = data()!.value;

    await add(user, 'body', '1');
    await runAction(user, 'n', '1r 1v:=x');

    // the part is saved only via its own save button
    expect(data()!.value).toBe(saved);
  });

  it('should save the rows of the table', async () => {
    const { user, data } = await setup({ part: { rows: [] } });

    await add(user, 'body', '1');
    await add(user, 'numbering');
    await runAction(user, 'n', '1r%2=1');
    await user.click(partSaveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_SHEET_LABELS_PART_TYPEID);
    expect(part.rows.map((r) => r.id)).toEqual(['1r', '1v']);
    expect(part.rows[1].columns).toEqual([
      expect.objectContaining({ id: 'n', value: '2' }),
    ]);
  });

  describe('column definitions', () => {
    async function editDefinition(user: User, column: string) {
      await pickOption(user, /^column/, column);
      await user.click(
        screen.getByRole('button', {
          description: /edit the selected column definition/i,
        }),
      );
    }

    it('should add a numbering definition', async () => {
      const { user, data } = await setup({ part: { rows: ROWS } });

      await editDefinition(user, 'n');
      expect(
        screen.getByRole('heading', { name: 'numbering' }),
      ).toBeInTheDocument();
      await user.type(screen.getByRole('textbox', { name: /^system/ }), 'rom');
      await user.type(
        screen.getByRole('textbox', { name: /^technique/ }),
        'ink',
      );
      await user.type(screen.getByRole('textbox', { name: /^position/ }), 'top');
      await user.click(
        screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
      );
      expect(screen.queryByRole('heading', { name: 'numbering' })).toBeNull();
      await user.click(partSaveButton());

      expect(data()!.value!.nDefinitions).toEqual([
        expect.objectContaining({
          id: 'n',
          system: 'rom',
          technique: 'ink',
          position: 'top',
        }),
      ]);
    });

    it('should edit an existing numbering definition', async () => {
      const { user, data } = await setup({
        part: {
          rows: ROWS,
          nDefinitions: [
            { id: 'n', system: 'rom', technique: 'ink', position: 'top' },
          ],
        },
      });

      await editDefinition(user, 'n');
      expect(screen.getByRole('textbox', { name: /^system/ })).toHaveValue(
        'rom',
      );
      await user.type(screen.getByRole('textbox', { name: /^note/ }), 'x');
      await user.click(
        screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
      );
      await user.click(partSaveButton());

      expect(data()!.value!.nDefinitions).toEqual([
        expect.objectContaining({ id: 'n', system: 'rom', note: 'x' }),
      ]);
    });

    it('should edit the quire description', async () => {
      const { user, data } = await setup({ part: { rows: ROWS } });

      await editDefinition(user, 'q');
      expect(screen.getByRole('heading', { name: 'quire' })).toBeInTheDocument();
      await user.type(
        screen.getByRole('textbox', { name: /^note$/ }),
        'quire note',
      );
      await user.click(
        screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
      );
      await user.click(partSaveButton());

      expect(data()!.value!.quireDescription).toEqual(
        expect.objectContaining({ note: 'quire note' }),
      );
    });

    it('should close the definition editor on cancel', async () => {
      const { user } = await setup({ part: { rows: ROWS } });

      await editDefinition(user, 'n');
      await user.click(
        screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
      );

      expect(screen.queryByRole('heading', { name: 'numbering' })).toBeNull();
    });
  });

  describe('endleaves', () => {
    async function openEndleaves(user: User) {
      await user.click(screen.getByRole('tab', { name: 'endleaves' }));
      // the add button precedes the endleaf editor panel header
      await screen.findAllByRole('button', { name: /^endleaf$/ });
    }
    const endleafRows = () =>
      screen.queryAllByRole('row').slice(1);
    const endleafButton = (row: number, description: RegExp) =>
      within(endleafRows()[row]).getByRole('button', { description });

    it('should list endleaves', async () => {
      const { user } = await setup({
        part: { rows: ROWS, endleaves: [E1, E2] },
      });
      await openEndleaves(user);

      expect(endleafRows()).toHaveLength(2);
      expect(within(endleafRows()[0]).getByText('Paper')).toBeInTheDocument();
      expect(
        within(endleafRows()[1]).getByText('Parchment'),
      ).toBeInTheDocument();
    });

    it('should add an endleaf at an endleaf location', async () => {
      const { user, data } = await setup({ part: { rows: ROWS } });
      await openEndleaves(user);

      await user.click(screen.getAllByRole('button', { name: /^endleaf$/ })[0]);
      await pickOption(user, /^location/, '(1)');
      await user.click(
        screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
      );

      expect(endleafRows()).toHaveLength(1);
      await user.click(partSaveButton());
      expect(data()!.value!.endleaves).toEqual([
        expect.objectContaining({ location: '(1)', material: 'paper' }),
      ]);
    });

    it('should clone an endleaf', async () => {
      const { user } = await setup({ part: { rows: ROWS, endleaves: [E1] } });
      await openEndleaves(user);

      await user.click(endleafButton(0, /clone this endleaf/i));

      expect(endleafRows()).toHaveLength(2);
    });

    it('should move endleaves', async () => {
      const { user, data } = await setup({
        part: { rows: ROWS, endleaves: [E1, E2] },
      });
      await openEndleaves(user);

      await user.click(endleafButton(0, /move this endleaf down/i));
      await user.click(partSaveButton());
      expect(data()!.value!.endleaves).toEqual([E2, E1]);

      await user.click(endleafButton(1, /move this endleaf up/i));
      await user.click(partSaveButton());
      expect(data()!.value!.endleaves).toEqual([E1, E2]);
    });

    it('should delete an endleaf after confirmation', async () => {
      const { user, data } = await setup({
        part: { rows: ROWS, endleaves: [E1] },
      });
      await openEndleaves(user);

      await user.click(endleafButton(0, /delete this endleaf/i));
      await user.click(partSaveButton());

      expect(data()!.value!.endleaves).toBeUndefined();
    });
  });

  it('should hide save for users below operator level', async () => {
    await setup({ part: { rows: ROWS }, roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ part: { rows: ROWS } });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });

  it('should load role-specific settings', async () => {
    const { mocks } = await setup({ part: { rows: ROWS } });

    await waitFor(() =>
      expect(mocks.appRepository.getSettingFor).toHaveBeenCalledWith(
        COD_SHEET_LABELS_PART_TYPEID,
        undefined,
      ),
    );
  });
});

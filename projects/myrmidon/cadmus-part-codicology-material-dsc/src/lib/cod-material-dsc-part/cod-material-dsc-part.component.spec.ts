import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';
import { CodPalimpsest } from '../cod-material-dsc-part';
import {
  buildEditedPart,
  buildPart,
  buildThesauri,
  createEditorMocks,
  provideEditorMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_MATERIAL_DSC_PART_TYPEID,
  CodUnit,
  CodMaterialDscPart,
} from '../cod-material-dsc-part';
import { CodMaterialDscPartComponent } from './cod-material-dsc-part.component';

describe('CodMaterialDscPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_MATERIAL_DSC_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };
  const E1: CodUnit = { material: 'parch', format: 'fol', state: 'good', ranges: [{ start: { n: 1 }, end: { n: 10 } }] };
  const E2: CodUnit = { material: 'paper', format: 'fol', state: 'bad', ranges: [{ start: { n: 11 }, end: { n: 20 } }] };
  const THESAURI: ThesauriSet = buildThesauri({
    'cod-unit-materials': [
      { id: 'parch', value: 'parchment' },
      { id: 'paper', value: 'paper' },
    ],
  });

  async function setup(options?: {
    entries?: CodUnit[];
    thesauri?: ThesauriSet;
    roles?: string[];
    confirm?: boolean;
    settings?: any;
    extra?: Partial<CodMaterialDscPart>;
  }) {
    const mocks = createEditorMocks(options);
    const data = signal<EditedObject<CodMaterialDscPart> | undefined>(
      buildEditedPart(
        options?.entries
          ? buildPart<CodMaterialDscPart>(COD_MATERIAL_DSC_PART_TYPEID, {
              units: options.entries,
              ...options.extra,
            })
          : undefined,
        options?.thesauri ?? THESAURI,
      ),
    );
    const editorClose = vi.fn();
    const result = await render(CodMaterialDscPartComponent, {
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
    expect(screen.getByText('Material Description Part')).toBeInTheDocument();
  });

  it('should list units', async () => {
    await setup({ entries: [E1, E2] });

    expect(rows()).toHaveLength(2);
    expect(within(rows()[0]).getByText('parchment')).toBeInTheDocument();
    expect(within(rows()[1]).getByText('paper')).toBeInTheDocument();
  });

  it('should not allow saving without units', async () => {
    await setup();
    expect(partSaveButton()).toBeDisabled();
  });

  it('should hide save for users below operator level', async () => {
    await setup({ entries: [E1], roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should add a unit and save the part', async () => {
    const { user, data } = await setup();

    await user.click(screen.getByRole('button', { name: /^unit$/ }));
    expect(screen.getByText(/#0/)).toBeInTheDocument();

    // material defaults to the first thesaurus entry
    await user.type(screen.getByRole('textbox', { name: /^format/ }), 'fol');
    await user.type(screen.getByRole('textbox', { name: /^state/ }), 'ok');
    await user.type(screen.getByRole('textbox', { name: /^range/ }), '5r');
    // let the location editor emit its debounced change
    await new Promise((r) => setTimeout(r, 350));
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.queryByText(/#0/)).toBeNull();

    await user.click(partSaveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_MATERIAL_DSC_PART_TYPEID);
    expect(part.units).toHaveLength(1);
    expect(part.units[0]).toEqual(expect.objectContaining({ material: 'parch', format: 'fol', state: 'ok', ranges: [expect.anything()] }));
  });

  it('should edit an existing unit', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this unit/i));
    expect(screen.getByText(/#2/)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /^note/ }), ' x ');
    await user.click(screen.getByRole('checkbox', { name: /no Gregory/ }));
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());
    await user.click(partSaveButton());

    expect(data()!.value!.units[1]).toEqual(
      expect.objectContaining({ material: 'paper', note: 'x', noGregory: true }),
    );
    expect(data()!.value!.units[0]).toEqual(E1);
  });

  it('should not save the part when accepting a unit', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(1, /edit this unit/i));
    await user.type(screen.getByRole('textbox', { name: /^note/ }), ' x ');
    await user.click(screen.getByRole('checkbox', { name: /no Gregory/ }));
    await waitFor(() => expect(acceptEntry()).toBeEnabled());
    await user.click(acceptEntry());

    // the part is saved only via its own save button
    expect(data()!.value!.units).toEqual([E1, E2]);
  });

  it('should close the unit editor on cancel', async () => {
    const { user, data } = await setup({ entries: [E1] });

    await user.click(rowButton(0, /edit this unit/i));
    await user.click(discardEntry());

    expect(screen.queryByText(/#1/)).toBeNull();
    expect(data()!.value!.units).toEqual([E1]);
  });

  it('should delete a unit after confirmation', async () => {
    const { user, mocks } = await setup({ entries: [E1, E2] });

    await user.click(rowButton(0, /delete this unit/i));

    expect(mocks.dialog.confirm).toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
    expect(within(rows()[0]).getByText('paper')).toBeInTheDocument();
  });

  it('should not delete a unit when not confirmed', async () => {
    const { user } = await setup({ entries: [E1, E2], confirm: false });

    await user.click(rowButton(0, /delete this unit/i));

    expect(rows()).toHaveLength(2);
  });

  it('should move units up and down', async () => {
    const { user, data } = await setup({ entries: [E1, E2] });

    expect(rowButton(0, /move this unit up/i)).toBeDisabled();
    expect(rowButton(1, /move this unit down/i)).toBeDisabled();

    await user.click(rowButton(0, /move this unit down/i));
    expect(within(rows()[0]).getByText('paper')).toBeInTheDocument();
    await user.click(partSaveButton());
    expect(data()!.value!.units).toEqual([E2, E1]);

    await user.click(rowButton(1, /move this unit up/i));
    expect(within(rows()[0]).getByText('parchment')).toBeInTheDocument();
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ entries: [E1] });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });

  describe('palimpsests', () => {
    const P1: CodPalimpsest = {
      ranges: [{ start: { n: 3 }, end: { n: 4 } }],
      chronotope: { place: { value: 'Bobbio' } },
    };
    const P2: CodPalimpsest = {
      ranges: [{ start: { n: 7 }, end: { n: 8 } }],
      note: 'second',
    };

    async function setupPs(palimpsests?: CodPalimpsest[], confirm = true) {
      const result = await setup({
        entries: [E1],
        extra: { palimpsests },
        confirm,
      });
      // palimpsests are inside a collapsed expansion panel
      await result.user.click(
        screen.getByRole('button', { name: /palimpsests/i }),
      );
      return result;
    }
    // palimpsests are in the second table
    const psRows = () =>
      within(screen.getAllByRole('table')[1]).getAllByRole('row').slice(1);

    it('should list palimpsests with their count', async () => {
      await setupPs([P1, P2]);

      expect(
        screen.getByRole('button', { name: /palimpsests\s*2/i }),
      ).toBeInTheDocument();
      expect(psRows()).toHaveLength(2);
      expect(within(psRows()[0]).getByText('Bobbio')).toBeInTheDocument();
    });

    it('should add a palimpsest', async () => {
      const { user, data } = await setupPs();

      await user.click(screen.getByRole('button', { name: /^palimpsest$/ }));
      expect(screen.getByText('#0')).toBeInTheDocument();
      await user.type(screen.getByRole('textbox', { name: /^note/ }), 'new');
      await user.click(acceptEntry());
      await user.click(partSaveButton());

      expect(data()!.value!.palimpsests).toEqual([
        expect.objectContaining({
          ranges: [{ start: { n: 0 }, end: { n: 0 } }],
          note: 'new',
        }),
      ]);
    });

    it('should save no palimpsests as undefined', async () => {
      const { user, data } = await setupPs();

      await user.click(partSaveButton());

      expect(data()!.value!.palimpsests).toBeUndefined();
    });

    it('should edit a palimpsest', async () => {
      const { user, data } = await setupPs([P1, P2]);

      await user.click(
        within(psRows()[1]).getByRole('button', {
          description: /edit this palimpsest/i,
        }),
      );
      expect(screen.getByRole('textbox', { name: /^note/ })).toHaveValue(
        'second',
      );
      await user.type(screen.getByRole('textbox', { name: /^note/ }), '!');
      await user.click(acceptEntry());
      await user.click(partSaveButton());

      expect(data()!.value!.palimpsests![1].note).toBe('second!');
    });

    it('should close the unit editor when editing a palimpsest', async () => {
      const { user } = await setupPs([P1]);

      await user.click(rowButton(0, /edit this unit/i));
      expect(screen.getByRole('checkbox', { name: /no Gregory/ })).toBeInTheDocument();

      await user.click(
        within(psRows()[0]).getByRole('button', {
          description: /edit this palimpsest/i,
        }),
      );
      expect(screen.queryByRole('checkbox', { name: /no Gregory/ })).toBeNull();
    });

    it('should delete a palimpsest after confirmation', async () => {
      const { user } = await setupPs([P1, P2]);

      await user.click(
        within(psRows()[0]).getByRole('button', {
          description: /delete this palimpsest/i,
        }),
      );

      expect(psRows()).toHaveLength(1);
      expect(within(psRows()[0]).queryByText('Bobbio')).toBeNull();
    });

    it('should not delete a palimpsest when not confirmed', async () => {
      const { user } = await setupPs([P1, P2], false);

      await user.click(
        within(psRows()[0]).getByRole('button', {
          description: /delete this palimpsest/i,
        }),
      );

      expect(psRows()).toHaveLength(2);
    });

    it('should move palimpsests up and down', async () => {
      const { user, data } = await setupPs([P1, P2]);

      await user.click(
        within(psRows()[0]).getByRole('button', {
          description: /move this palimpsest down/i,
        }),
      );
      await user.click(partSaveButton());
      expect(data()!.value!.palimpsests).toEqual([P2, P1]);

      await user.click(
        within(psRows()[1]).getByRole('button', {
          description: /move this palimpsest up/i,
        }),
      );
      await user.click(partSaveButton());
      expect(data()!.value!.palimpsests).toEqual([P1, P2]);
    });
  });
});

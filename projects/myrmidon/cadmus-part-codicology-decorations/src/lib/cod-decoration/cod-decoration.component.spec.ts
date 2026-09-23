import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { NGX_MONACO_LOADER_PROVIDER } from '@jean-merelis/ngx-monaco-editor';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { CadmusTextEdService } from '@myrmidon/cadmus-text-ed';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { CodDecoration, CodDecorationElement } from '../cod-decorations-part';
import { CodDecorationComponent } from './cod-decoration.component';

describe('CodDecorationComponent', () => {
  const TYPES: ThesaurusEntry[] = [
    { id: 'initial', value: 'Initial' },
    { id: 'frame', value: 'Frame' },
  ];
  const E1: CodDecorationElement = {
    key: 'e1',
    type: 'initial',
    flags: [],
    ranges: [{ start: { n: 1 }, end: { n: 1 } }],
    subject: 'a saint',
  };
  const E2: CodDecorationElement = {
    key: 'e2',
    parentKey: 'e1',
    type: 'frame',
    flags: [],
    ranges: [{ start: { n: 2 }, end: { n: 2 } }],
  };
  const DECORATION: CodDecoration = {
    eid: 'd1',
    name: 'main',
    flags: ['rich'],
    note: 'a note',
    artists: [{ type: 'painter', name: 'Giotto' }],
    elements: [E1, E2],
  };

  async function setup(
    decoration?: CodDecoration,
    options?: { hideArtists?: boolean; confirm?: boolean },
  ) {
    const model = signal<CodDecoration | undefined>(decoration);
    const editorClose = vi.fn();
    const dialog = { confirm: vi.fn(() => of(options?.confirm ?? true)) };
    const result = await render(CodDecorationComponent, {
      bindings: [
        twoWayBinding('decoration', model),
        inputBinding('decElemTypeEntries', () => TYPES),
        inputBinding('decFlagEntries', () => [
          { id: 'rich', value: 'rich' },
          { id: 'poor', value: 'poor' },
        ]),
        inputBinding('hideArtists', () => options?.hideArtists),
        inputBinding('artTypeEntries', () => [
          { id: 'painter', value: 'Painter' },
        ]),
        outputBinding('editorClose', editorClose),
      ],
      providers: [
        { provide: DialogService, useValue: dialog },
        { provide: CadmusTextEdService, useValue: { edit: vi.fn() } },
        // monaco is not available in jsdom: never load it
        {
          provide: NGX_MONACO_LOADER_PROVIDER,
          useValue: { monacoLoaded: () => new Promise(() => {}) },
        },
      ],
    });
    return { ...result, model, editorClose, dialog, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getAllByRole('textbox', { name })[0] as HTMLInputElement;
  const saveButton = () =>
    screen.getByRole('button', { description: /accept decoration changes/i });
  // the elements table is the last one
  const elementRows = () =>
    within(screen.getAllByRole('table').at(-1)!)
      .getAllByRole('row')
      .slice(1);
  const elementButton = (row: number, description: RegExp) =>
    within(elementRows()[row]).getByRole('button', { description });

  it('should show the decoration values', async () => {
    await setup(DECORATION);

    expect(textbox(/^ID/)).toHaveValue('d1');
    expect(textbox(/^name/)).toHaveValue('main');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(screen.getByRole('checkbox', { name: /rich/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /poor/ })).not.toBeChecked();
    expect(saveButton()).toBeDisabled();
  });

  it('should list elements', async () => {
    await setup(DECORATION);

    expect(elementRows()).toHaveLength(2);
    expect(within(elementRows()[0]).getByText('Initial')).toBeInTheDocument();
    expect(within(elementRows()[0]).getByText('a saint')).toBeInTheDocument();
    expect(within(elementRows()[1]).getByText('e1')).toBeInTheDocument();
  });

  it('should require a name', async () => {
    const { user } = await setup(DECORATION);

    await user.clear(textbox(/^name/));
    await user.tab();

    expect(screen.getByText('name required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited decoration', async () => {
    const { user, model } = await setup(DECORATION);

    await user.clear(textbox(/^name/));
    await user.type(textbox(/^name/), ' other ');
    await user.click(screen.getByRole('checkbox', { name: /rich/ }));
    await user.click(saveButton());

    expect(model()).toEqual({
      eid: 'd1',
      name: 'other',
      flags: undefined,
      chronotopes: undefined,
      references: undefined,
      artists: DECORATION.artists,
      note: 'a note',
      elements: [E1, E2],
    });
  });

  it('should add an element with the default type', async () => {
    const { user, model } = await setup({ name: 'd' });

    await user.click(screen.getByRole('button', { name: /^element$/ }));
    await user.type(
      screen.getByRole('textbox', { name: /^ranges/ }),
      '3r',
    );
    await new Promise((r) => setTimeout(r, 350));
    await user.type(screen.getByRole('textbox', { name: /^key/ }), 'new');
    await user.click(
      screen.getByRole('button', { description: /accept element changes/i }),
    );

    expect(elementRows()).toHaveLength(1);
    expect(within(elementRows()[0]).getByText('Initial')).toBeInTheDocument();

    await user.type(textbox(/^name/), '!');
    await user.click(saveButton());
    expect(model()!.elements).toEqual([
      expect.objectContaining({ key: 'new', type: 'initial' }),
    ]);
  });

  it('should offer element keys as parent keys', async () => {
    const { user } = await setup(DECORATION);

    await user.click(elementButton(1, /edit this element/i));
    await user.click(screen.getByRole('combobox', { name: /parent key/ }));

    expect(
      await screen.findByRole('option', { name: 'e1' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'e2' })).toBeInTheDocument();
  });

  it('should edit an element', async () => {
    const { user, model } = await setup(DECORATION);

    await user.click(elementButton(0, /edit this element/i));
    const key = screen.getByRole('textbox', { name: /^key/ });
    expect(key).toHaveValue('e1');
    await user.type(key, 'x');
    await user.click(
      screen.getByRole('button', { description: /accept element changes/i }),
    );
    await user.type(textbox(/^name/), '!');
    await user.click(saveButton());

    expect(model()!.elements![0].key).toBe('e1x');
  });

  it('should remove an element after confirmation', async () => {
    const { user, dialog } = await setup(DECORATION);

    await user.click(elementButton(0, /delete this element/i));

    expect(dialog.confirm).toHaveBeenCalled();
    expect(elementRows()).toHaveLength(1);
    expect(within(elementRows()[0]).getByText('Frame')).toBeInTheDocument();
  });

  it('should not remove an element when not confirmed', async () => {
    const { user } = await setup(DECORATION, { confirm: false });

    await user.click(elementButton(0, /delete this element/i));

    expect(elementRows()).toHaveLength(2);
  });

  it('should move elements', async () => {
    const { user, model } = await setup(DECORATION);

    expect(elementButton(0, /move this element up/i)).toBeDisabled();
    await user.click(elementButton(0, /move this element down/i));
    await user.click(saveButton());
    expect(model()!.elements).toEqual([E2, E1]);

    await user.click(elementButton(1, /move this element up/i));
    await user.click(saveButton());
    expect(model()!.elements).toEqual([E1, E2]);
  });

  describe('artists', () => {
    const openArtists = async (user: ReturnType<typeof userEvent.setup>) =>
      user.click(screen.getByRole('button', { name: /^artists/ }));
    const artistRows = () =>
      within(screen.getByRole('region', { name: /^artists/ }))
        .getAllByRole('row')
        .slice(1);

    it('should list artists', async () => {
      const { user } = await setup(DECORATION);
      await openArtists(user);

      expect(artistRows()).toHaveLength(1);
      expect(within(artistRows()[0]).getByText('Giotto')).toBeInTheDocument();
      expect(within(artistRows()[0]).getByText('Painter')).toBeInTheDocument();
    });

    it('should add an artist', async () => {
      const { user, model } = await setup(DECORATION);
      await openArtists(user);

      await user.click(screen.getByRole('button', { name: /^artist$/ }));
      const editor = screen.getByRole('region', { name: /^artist\s*$/ });
      await user.type(
        within(editor).getAllByRole('textbox', { name: /^name/ })[0],
        'Cimabue',
      );
      // the artist editor's accept button is its last one
      await user.click(
        within(editor)
          .getAllByRole('button', { description: /accept changes/i })
          .at(-1)!,
      );

      expect(artistRows()).toHaveLength(2);
      await user.type(textbox(/^name/), '!');
      await user.click(saveButton());
      expect(model()!.artists![1]).toEqual(
        expect.objectContaining({ name: 'Cimabue' }),
      );
    });

    it('should remove an artist, saving none as undefined', async () => {
      const { user, model } = await setup(DECORATION);
      await openArtists(user);

      await user.click(
        within(artistRows()[0]).getByRole('button', {
          description: /delete this artist/i,
        }),
      );
      await user.click(saveButton());

      expect(model()!.artists).toBeUndefined();
    });

    it('should hide artists when requested', async () => {
      await setup(DECORATION, { hideArtists: true });

      expect(screen.queryByRole('button', { name: /^artists/ })).toBeNull();
    });
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(DECORATION);

    await user.click(
      screen.getByRole('button', { description: /discard decoration changes/i }),
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

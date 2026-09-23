import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { CodDecorationArtist } from '../cod-decorations-part';
import { CodDecorationArtistComponent } from './cod-decoration-artist.component';

describe('CodDecorationArtistComponent', () => {
  const ARTIST: CodDecorationArtist = {
    eid: 'a1',
    type: 'painter',
    name: 'Giotto',
    elementKeys: ['b', 'a'],
    note: 'a note',
    styles: [{ name: 'gothic' }, { name: 'roman' }],
  };

  async function setup(
    artist?: CodDecorationArtist,
    options?: { types?: ThesaurusEntry[]; confirm?: boolean },
  ) {
    const model = signal<CodDecorationArtist | undefined>(artist);
    const editorClose = vi.fn();
    const dialog = { confirm: vi.fn(() => of(options?.confirm ?? true)) };
    const result = await render(CodDecorationArtistComponent, {
      bindings: [
        twoWayBinding('artist', model),
        inputBinding('artTypeEntries', () => options?.types),
        outputBinding('editorClose', editorClose),
      ],
      providers: [{ provide: DialogService, useValue: dialog }],
    });
    return { ...result, model, editorClose, dialog, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  // the styles table is the first one
  const styleRows = () =>
    within(screen.getAllByRole('table')[0]).queryAllByRole('row').slice(1);
  const styleNames = () =>
    styleRows().map((r) => within(r).getAllByRole('cell')[1].textContent);
  // the artist editor's own buttons are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the artist values', async () => {
    await setup(ARTIST);

    expect(textbox(/^type/)).toHaveValue('painter');
    expect(textbox(/^EID/)).toHaveValue('a1');
    expect(textbox(/^name/)).toHaveValue('Giotto');
    expect(textbox(/^element keys/)).toHaveValue('b a');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(styleNames()).toEqual(['gothic', 'roman']);
    expect(saveButton()).toBeDisabled();
  });

  it('should use a select for type when entries are provided', async () => {
    await setup(ARTIST, { types: [{ id: 'painter', value: 'Painter' }] });

    const type = screen.getByRole('combobox', { name: /type/ });
    await waitFor(() => expect(type).toHaveTextContent('Painter'));
  });

  it('should save element keys deduplicated and sorted', async () => {
    const { user, model } = await setup(ARTIST);

    await user.clear(textbox(/^element keys/));
    await user.type(textbox(/^element keys/), 'z  y z x');
    await user.click(saveButton());

    expect(model()).toEqual({
      eid: 'a1',
      type: 'painter',
      name: 'Giotto',
      ids: undefined,
      styles: ARTIST.styles,
      elementKeys: ['x', 'y', 'z'],
      note: 'a note',
    });
  });

  it('should save no element keys as undefined', async () => {
    const { user, model } = await setup(ARTIST);

    await user.clear(textbox(/^element keys/));
    await user.click(saveButton());

    expect(model()!.elementKeys).toBeUndefined();
  });

  it('should add a style', async () => {
    const { user, model } = await setup(ARTIST);

    // the add button precedes the (empty) style panel header
    await user.click(screen.getAllByRole('button', { name: /^style$/ })[0]);
    // the style editor is the first one with a name field after the artist's
    const styleName = screen.getAllByRole('textbox', { name: /^name/ })[1];
    await user.clear(styleName);
    await user.type(styleName, 'baroque');
    // the style editor's accept button precedes the artist's one
    const accepts = screen.getAllByRole('button', {
      description: /accept changes/i,
    });
    await user.click(accepts.at(-2)!);

    expect(styleNames()).toEqual(['gothic', 'roman', 'baroque']);
    await user.type(textbox(/^note/), '!');
    await user.click(saveButton());
    expect(model()!.styles).toEqual([
      { name: 'gothic' },
      { name: 'roman' },
      expect.objectContaining({ name: 'baroque' }),
    ]);
  });

  it('should edit an existing style', async () => {
    const { user, model } = await setup(ARTIST);

    await user.click(
      within(styleRows()[1]).getByRole('button', {
        description: /edit this style/i,
      }),
    );
    const styleName = screen.getAllByRole('textbox', { name: /^name/ })[1];
    expect(styleName).toHaveValue('roman');
    await user.type(styleName, 'esque');
    await user.click(
      screen
        .getAllByRole('button', { description: /accept changes/i })
        .at(-2)!,
    );
    await user.type(textbox(/^note/), '!');
    await user.click(saveButton());

    expect(model()!.styles).toEqual([
      { name: 'gothic' },
      expect.objectContaining({ name: 'romanesque' }),
    ]);
  });

  it('should remove a style after confirmation', async () => {
    const { user, model, dialog } = await setup(ARTIST);

    await user.click(
      within(styleRows()[0]).getByRole('button', {
        description: /remove this style/i,
      }),
    );
    expect(dialog.confirm).toHaveBeenCalled();
    await user.click(saveButton());

    expect(model()!.styles).toEqual([{ name: 'roman' }]);
  });

  it('should not remove a style when not confirmed', async () => {
    const { user } = await setup(ARTIST, { confirm: false });

    await user.click(
      within(styleRows()[0]).getByRole('button', {
        description: /remove this style/i,
      }),
    );

    expect(styleRows()).toHaveLength(2);
  });

  it('should move styles', async () => {
    const { user } = await setup(ARTIST);

    await user.click(
      within(styleRows()[0]).getByRole('button', {
        description: /move style down/i,
      }),
    );
    expect(styleNames()).toEqual(['roman', 'gothic']);

    await user.click(
      within(styleRows()[1]).getByRole('button', {
        description: /move style up/i,
      }),
    );
    expect(styleNames()).toEqual(['gothic', 'roman']);
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(ARTIST);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

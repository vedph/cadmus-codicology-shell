import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodBinding } from '../cod-bindings-part';
import { CodBindingEditorComponent } from './cod-binding-editor.component';

describe('CodBindingEditorComponent', () => {
  const BINDING: CodBinding = {
    tag: 'orig',
    coverMaterial: 'leather',
    boardMaterial: 'wood',
    chronotope: { place: { value: 'Rome' } },
    description: 'A binding',
  };

  async function setup(
    binding?: CodBinding,
    entries?: {
      tag?: ThesaurusEntry[];
      cover?: ThesaurusEntry[];
      board?: ThesaurusEntry[];
    },
  ) {
    const model = signal<CodBinding | undefined>(binding);
    const editorClose = vi.fn();
    const result = await render(CodBindingEditorComponent, {
      bindings: [
        twoWayBinding('binding', model),
        inputBinding('tagEntries', () => entries?.tag),
        inputBinding('coverEntries', () => entries?.cover),
        inputBinding('boardEntries', () => entries?.board),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  // nested editors have their own accept buttons: ours is the last one
  const getSaveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;
  const getCancelButton = () =>
    screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!;

  it('should show the binding values in free text fields', async () => {
    await setup(BINDING);

    expect(screen.getByRole('textbox', { name: /^tag/ })).toHaveValue('orig');
    expect(screen.getByRole('textbox', { name: /cover material/ })).toHaveValue(
      'leather',
    );
    expect(screen.getByRole('textbox', { name: /board material/ })).toHaveValue(
      'wood',
    );
    expect(screen.getByRole('textbox', { name: /description/ })).toHaveValue(
      'A binding',
    );
    expect(screen.getByRole('checkbox', { name: /has size/ })).not.toBeChecked();
  });

  it('should use selects when thesauri entries are provided', async () => {
    await setup(BINDING, {
      tag: [{ id: 'orig', value: 'original' }],
      cover: [{ id: 'leather', value: 'Leather' }],
      board: [{ id: 'wood', value: 'Wood' }],
    });

    expect(screen.queryByRole('textbox', { name: /cover material/ })).toBeNull();
    const cover = screen.getByRole('combobox', { name: /cover/ });
    await waitFor(() => expect(cover).toHaveTextContent('Leather'));
    expect(screen.getByRole('combobox', { name: /board/ })).toHaveTextContent(
      'Wood',
    );
    expect(screen.getByRole('combobox', { name: /tag/ })).toHaveTextContent(
      'original',
    );
  });

  it('should disable save while pristine', async () => {
    await setup(BINDING);
    expect(getSaveButton()).toBeDisabled();
  });

  it('should save the edited binding', async () => {
    const { user, model } = await setup(BINDING);

    const cover = screen.getByRole('textbox', { name: /cover material/ });
    await user.clear(cover);
    await user.type(cover, ' paper ');
    await user.clear(screen.getByRole('textbox', { name: /description/ }));
    await user.click(getSaveButton());

    expect(model()).toEqual({
      tag: 'orig',
      coverMaterial: 'paper',
      boardMaterial: 'wood',
      chronotope: BINDING.chronotope,
      size: undefined,
      description: '',
    });
  });

  it('should require the cover material', async () => {
    const { user, model } = await setup(BINDING);

    await user.clear(screen.getByRole('textbox', { name: /cover material/ }));
    await user.tab();

    expect(screen.getByText('cover material required')).toBeInTheDocument();
    expect(getSaveButton()).toBeDisabled();
    expect(model()).toBe(BINDING);
  });

  it('should require the board material', async () => {
    const { user } = await setup(BINDING);

    await user.clear(screen.getByRole('textbox', { name: /board material/ }));
    await user.tab();

    expect(screen.getByText('board material required')).toBeInTheDocument();
  });

  it('should show the size editor when has size is checked', async () => {
    const { user } = await setup(BINDING);
    expect(screen.queryByText('size', { selector: 'legend' })).toBeNull();

    await user.click(screen.getByRole('checkbox', { name: /has size/ }));

    expect(
      screen.getByText('size', { selector: 'legend' }),
    ).toBeInTheDocument();
  });

  it('should check has size for a binding with size', async () => {
    await setup({
      ...BINDING,
      size: {
        w: { value: 10, unit: 'cm' },
        h: { value: 20, unit: 'cm' },
      },
    });

    expect(screen.getByRole('checkbox', { name: /has size/ })).toBeChecked();
  });

  it('should drop the size when has size is unchecked', async () => {
    const { user, model } = await setup({
      ...BINDING,
      size: {
        w: { value: 10, unit: 'cm' },
        h: { value: 20, unit: 'cm' },
      },
    });

    await user.click(screen.getByRole('checkbox', { name: /has size/ }));
    await user.click(getSaveButton());

    expect(model()!.size).toBeUndefined();
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(BINDING);

    await user.click(getCancelButton());

    expect(editorClose).toHaveBeenCalled();
  });
});

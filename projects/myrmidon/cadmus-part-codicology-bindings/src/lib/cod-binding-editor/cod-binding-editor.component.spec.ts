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
      // empty optional text is now saved as missing
      description: undefined,
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

  // signal forms regressions

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  it('should stay pristine when its child editors echo their data', async () => {
    await setup({
      ...BINDING,
      size: {
        w: { value: 10, unit: 'cm' },
        h: { value: 20, unit: 'cm' },
      },
    });

    // past the debounce of the autosaving child editors
    await wait(600);

    expect(getSaveButton()).toBeDisabled();
  });

  it('should save on Enter in a text input when dirty', async () => {
    const { user, model } = await setup(BINDING);

    await user.type(
      screen.getByRole('textbox', { name: /board material/ }),
      'x{Enter}',
    );

    expect(model()!.boardMaterial).toBe('woodx');
  });

  it('should not save on Enter while pristine', async () => {
    const { user, model } = await setup(BINDING);

    await user.type(
      screen.getByRole('textbox', { name: /board material/ }),
      '{Enter}',
    );

    expect(model()).toBe(BINDING);
  });

  it('should save a binding without the form identity tags', async () => {
    const { user, model } = await setup(BINDING);

    await user.type(screen.getByRole('textbox', { name: /^tag/ }), 'x');
    await user.click(getSaveButton());

    expect(Object.getOwnPropertySymbols(model()!.chronotope)).toHaveLength(0);
    expect(model()!.chronotope).not.toBe(BINDING.chronotope);
  });

  it('should render no form element', async () => {
    const { container } = await setup(BINDING);
    expect(container.querySelector('form')).toBeNull();
  });

  it('should ignore a child echo of its data, also when normalized', async () => {
    const { fixture } = await setup(BINDING);

    // an autosaving child emits a normalized copy of what it got
    fixture.componentInstance.onChronotopeChange({
      place: { value: 'Rome', tag: undefined },
    } as any);
    fixture.detectChanges();

    expect(getSaveButton()).toBeDisabled();
  });

  it('should get dirty for a real child change', async () => {
    const { fixture } = await setup(BINDING);

    fixture.componentInstance.onChronotopeChange({
      place: { value: 'Milan' },
    });
    fixture.detectChanges();

    expect(getSaveButton()).toBeEnabled();
  });
});

import { outputBinding, signal, twoWayBinding } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { CodWatermark } from '../cod-watermarks-part';
import { CodWatermarkEditorComponent } from './cod-watermark-editor.component';

describe('CodWatermarkEditorComponent', () => {
  const WATERMARK: CodWatermark = {
    name: 'crown',
    description: 'a crown',
    rangesAsQuire: true,
    size: {
      w: { value: 20, unit: 'mm' },
      h: { value: 30, unit: 'mm' },
    },
  };

  async function setup(watermark?: CodWatermark) {
    const model = signal<CodWatermark | undefined>(watermark);
    const editorClose = vi.fn();
    const result = await render(CodWatermarkEditorComponent, {
      bindings: [
        twoWayBinding('watermark', model),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  // nested editors have their own buttons: ours are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the watermark values', async () => {
    await setup(WATERMARK);

    expect(textbox(/^name/)).toHaveValue('crown');
    expect(textbox(/^description/)).toHaveValue('a crown');
    expect(screen.getByRole('checkbox', { name: /quire/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /has size/ })).toBeChecked();
    expect(screen.getByText('size', { selector: 'legend' })).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should require a name', async () => {
    const { user } = await setup(WATERMARK);

    await user.clear(textbox(/^name/));
    await user.tab();

    expect(screen.getByText('name required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited watermark', async () => {
    const { user, model } = await setup({ name: 'crown' });

    await user.clear(textbox(/^name/));
    await user.type(textbox(/^name/), ' star ');
    await user.type(textbox(/^description/), ' desc ');
    await user.click(screen.getByRole('checkbox', { name: /quire/ }));
    await user.click(saveButton());

    expect(model()).toEqual({
      name: 'star',
      sampleRange: undefined,
      ranges: undefined,
      rangesAsQuire: true,
      ids: undefined,
      size: undefined,
      chronotopes: undefined,
      description: 'desc',
    });
  });

  it('should save location ranges typed by the user', async () => {
    const { user, model } = await setup({ name: 'crown' });

    await user.type(textbox(/^ranges/), '1r-2v');
    await user.type(textbox(/^sample/), '3r');
    await waitFor(() => expect(saveButton()).toBeEnabled());
    // let the location editors emit their debounced changes
    await new Promise((r) => setTimeout(r, 350));
    await user.click(saveButton());

    expect(model()!.ranges).toHaveLength(1);
    expect(model()!.ranges![0].start.n).toBe(1);
    expect(model()!.ranges![0].end.n).toBe(2);
    expect(model()!.sampleRange?.start.n).toBe(3);
  });

  it('should drop the size when has size is unchecked', async () => {
    const { user, model } = await setup(WATERMARK);

    await user.click(screen.getByRole('checkbox', { name: /has size/ }));
    expect(screen.queryByText('size', { selector: 'legend' })).toBeNull();
    await user.click(saveButton());

    expect(model()!.size).toBeUndefined();
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(WATERMARK);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

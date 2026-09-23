import { outputBinding, signal, twoWayBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { CodDecorationArtistStyle } from '../cod-decorations-part';
import { CodDecorationArtistStyleComponent } from './cod-decoration-artist-style.component';

describe('CodDecorationArtistStyleComponent', () => {
  const STYLE: CodDecorationArtistStyle = {
    name: 'gothic',
    chronotope: { place: { value: 'Paris' } },
  };

  async function setup(style?: CodDecorationArtistStyle) {
    const model = signal<CodDecorationArtistStyle | undefined>(style);
    const editorClose = vi.fn();
    const result = await render(CodDecorationArtistStyleComponent, {
      bindings: [
        twoWayBinding('style', model),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const nameInput = () => screen.getByRole('textbox', { name: /^name/ });
  // nested editors have their own buttons: ours are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the style values', async () => {
    await setup(STYLE);

    expect(nameInput()).toHaveValue('gothic');
    expect(screen.getByRole('checkbox', { name: 'chronotope' })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'assertion' }),
    ).not.toBeChecked();
    expect(saveButton()).toBeDisabled();
  });

  it('should require a name', async () => {
    const { user } = await setup(STYLE);

    await user.clear(nameInput());
    await user.tab();

    expect(screen.getByText('name required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited style', async () => {
    const { user, model } = await setup(STYLE);

    await user.clear(nameInput());
    await user.type(nameInput(), ' roman ');
    await user.click(saveButton());

    expect(model()).toEqual({
      name: 'roman',
      chronotope: STYLE.chronotope,
      assertion: undefined,
    });
  });

  it('should drop the chronotope when unchecked', async () => {
    const { user, model } = await setup(STYLE);

    await user.click(screen.getByRole('checkbox', { name: 'chronotope' }));
    await user.click(saveButton());

    expect(model()!.chronotope).toBeUndefined();
  });

  it('should show the assertion editor when checked', async () => {
    const { user } = await setup(STYLE);
    const before = screen.getAllByRole('button').length;

    await user.click(screen.getByRole('checkbox', { name: 'assertion' }));

    expect(screen.getAllByRole('button').length).toBeGreaterThan(before);
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(STYLE);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

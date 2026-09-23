import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodShelfmark } from '../cod-shelfmarks-part';
import { CodShelfmarkEditorComponent } from './cod-shelfmark-editor.component';

describe('CodShelfmarkEditorComponent', () => {
  const SHELFMARK: CodShelfmark = {
    tag: 'current',
    city: 'Venice',
    library: 'Marciana',
    fund: 'Lat.',
    location: 'Z 1',
  };
  const LIBRARIES: ThesaurusEntry[] = [
    { id: 'marc', value: 'Marciana (Venice)' },
    { id: 'bncf', value: 'Nazionale (Florence)' },
    { id: 'none', value: 'Unknown' },
  ];
  const CITY_PATTERN = '\\(([^)]+)\\)$';

  async function setup(options?: {
    shelfmark?: CodShelfmark;
    tagEntries?: ThesaurusEntry[];
    cityEntries?: ThesaurusEntry[];
    libEntries?: ThesaurusEntry[];
    cityFromLibPattern?: string;
  }) {
    const model = signal<CodShelfmark | undefined>(options?.shelfmark);
    const editorClose = vi.fn();
    const result = await render(CodShelfmarkEditorComponent, {
      bindings: [
        twoWayBinding('shelfmark', model),
        inputBinding('tagEntries', () => options?.tagEntries),
        inputBinding('cityEntries', () => options?.cityEntries),
        inputBinding('libEntries', () => options?.libEntries),
        inputBinding('cityFromLibPattern', () => options?.cityFromLibPattern),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  const saveButton = () =>
    screen.getByRole('button', { description: /accept changes/i });

  it('should show the shelfmark values', async () => {
    await setup({ shelfmark: SHELFMARK });

    expect(textbox(/tag/)).toHaveValue('current');
    expect(textbox(/city/)).toHaveValue('Venice');
    expect(textbox(/library/)).toHaveValue('Marciana');
    expect(textbox(/fund/)).toHaveValue('Lat.');
    expect(textbox(/location/)).toHaveValue('Z 1');
    expect(saveButton()).toBeDisabled();
  });

  it('should save trimmed values, dropping empty ones', async () => {
    const { user, model } = await setup({ shelfmark: SHELFMARK });

    await user.clear(textbox(/fund/));
    await user.clear(textbox(/location/));
    await user.type(textbox(/location/), '  Z 2 ');
    await user.click(saveButton());

    expect(model()).toEqual({
      tag: 'current',
      city: 'Venice',
      library: 'Marciana',
      fund: undefined,
      location: 'Z 2',
    });
  });

  it('should show a max length error for a too long city', async () => {
    const { user } = await setup({ shelfmark: SHELFMARK });

    await user.clear(textbox(/city/));
    await user.type(textbox(/city/), 'x'.repeat(101));
    await user.tab();

    expect(saveButton()).toBeDisabled();
  });

  it('should use selects when thesauri are provided', async () => {
    await setup({
      shelfmark: { library: 'bncf', city: 'fi', tag: 't' },
      tagEntries: [{ id: 't', value: 'Tag' }],
      cityEntries: [{ id: 'fi', value: 'Florence' }],
      libEntries: LIBRARIES,
    });

    const lib = screen.getByRole('combobox', { name: /library/ });
    await waitFor(() => expect(lib).toHaveTextContent('Nazionale (Florence)'));
    expect(screen.getByRole('combobox', { name: /city/ })).toHaveTextContent(
      'Florence',
    );
    expect(screen.getByRole('combobox', { name: /tag/ })).toHaveTextContent(
      'Tag',
    );
  });

  it('should extract the city from the library when a pattern is set', async () => {
    const { user, model } = await setup({
      shelfmark: { library: 'marc', location: 'Z 1' },
      libEntries: LIBRARIES,
      cityFromLibPattern: CITY_PATTERN,
    });

    // city is disabled and extracted from the initial library
    expect(textbox(/city/)).toBeDisabled();
    expect(textbox(/city/)).toHaveValue('Venice');

    // pick another library
    await user.click(screen.getByRole('combobox', { name: /library/ }));
    await user.click(
      await screen.findByRole('option', { name: 'Nazionale (Florence)' }),
    );
    expect(textbox(/city/)).toHaveValue('Florence');

    await user.click(saveButton());
    expect(model()).toEqual(
      expect.objectContaining({ library: 'bncf', city: 'Florence' }),
    );
  });

  it('should clear the city when the library does not match the pattern', async () => {
    const { user } = await setup({
      shelfmark: { library: 'marc' },
      libEntries: LIBRARIES,
      cityFromLibPattern: CITY_PATTERN,
    });

    await user.click(screen.getByRole('combobox', { name: /library/ }));
    await user.click(await screen.findByRole('option', { name: 'Unknown' }));

    expect(textbox(/city/)).toHaveValue('');
  });

  it('should keep city enabled without library entries', async () => {
    await setup({
      shelfmark: SHELFMARK,
      cityFromLibPattern: CITY_PATTERN,
    });

    expect(textbox(/city/)).toBeEnabled();
    expect(textbox(/city/)).toHaveValue('Venice');
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup({ shelfmark: SHELFMARK });

    await user.click(
      screen.getByRole('button', { description: /discard changes/i }),
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { provideRefsMocks } from '../../../../../../testing/cadmus-test-helpers';
import { CodCColDefinition } from '../cod-sheet-labels-part';
import { CodCColDefinitionComponent } from './cod-c-col-definition.component';

describe('CodCColDefinitionComponent', () => {
  const DEFINITION: CodCColDefinition = {
    id: 'c',
    rank: 2,
    position: 'bottom',
    isVertical: true,
    decoration: 'frame',
    note: 'a note',
  };

  async function setup(
    definition?: CodCColDefinition,
    posEntries?: ThesaurusEntry[],
  ) {
    const model = signal<CodCColDefinition | undefined>(definition);
    const editorClose = vi.fn();
    const result = await render(CodCColDefinitionComponent, {
      bindings: [
        twoWayBinding('definition', model),
        inputBinding('posEntries', () => posEntries),
        outputBinding('editorClose', editorClose),
      ],
      providers: provideRefsMocks(),
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  // nested editors have their own buttons: ours are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the definition values', async () => {
    await setup(DEFINITION);

    expect(screen.getByRole('spinbutton', { name: /rank/ })).toHaveValue(2);
    expect(textbox(/^position/)).toHaveValue('bottom');
    expect(screen.getByRole('checkbox', { name: /vertical/ })).toBeChecked();
    expect(textbox(/^decoration/)).toHaveValue('frame');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(saveButton()).toBeDisabled();
  });

  it('should use a select for position when entries are provided', async () => {
    await setup(DEFINITION, [{ id: 'bottom', value: 'bottom margin' }]);

    const position = screen.getByRole('combobox', { name: /position/ });
    await waitFor(() => expect(position).toHaveTextContent('bottom margin'));
  });

  it('should require the position', async () => {
    const { user } = await setup(DEFINITION);

    await user.clear(textbox(/^position/));
    await user.tab();

    expect(screen.getByText('position required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited definition, keeping its ID', async () => {
    const { user, model } = await setup(DEFINITION);

    await user.click(screen.getByRole('checkbox', { name: /vertical/ }));
    const rank = screen.getByRole('spinbutton', { name: /rank/ });
    await user.clear(rank);
    await user.type(rank, '3');
    await user.clear(textbox(/^decoration/));
    await user.type(textbox(/^decoration/), ' none ');
    await user.click(saveButton());

    expect(model()).toEqual({
      id: 'c',
      rank: 3,
      position: 'bottom',
      isVertical: false,
      decoration: 'none',
      links: [],
      note: 'a note',
    });
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(DEFINITION);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

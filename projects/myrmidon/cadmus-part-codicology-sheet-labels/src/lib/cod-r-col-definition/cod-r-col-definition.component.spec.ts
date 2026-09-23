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
import { CodRColDefinition } from '../cod-sheet-labels-part';
import { CodRColDefinitionComponent } from './cod-r-col-definition.component';

describe('CodRColDefinitionComponent', () => {
  const DEFINITION: CodRColDefinition = {
    id: 'r',
    rank: 1,
    position: 'top',
    note: 'a note',
  };

  async function setup(
    definition?: CodRColDefinition,
    posEntries?: ThesaurusEntry[],
  ) {
    const model = signal<CodRColDefinition | undefined>(definition);
    const editorClose = vi.fn();
    const result = await render(CodRColDefinitionComponent, {
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

    expect(screen.getByRole('spinbutton', { name: /rank/ })).toHaveValue(1);
    expect(textbox(/^position/)).toHaveValue('top');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(saveButton()).toBeDisabled();
  });

  it('should use a select for position when entries are provided', async () => {
    await setup(DEFINITION, [{ id: 'top', value: 'Top' }]);

    const position = screen.getByRole('combobox', { name: /position/ });
    await waitFor(() => expect(position).toHaveTextContent('Top'));
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

    await user.clear(textbox(/^position/));
    await user.type(textbox(/^position/), ' bottom ');
    await user.click(saveButton());

    expect(model()).toEqual({
      id: 'r',
      rank: 1,
      position: 'bottom',
      links: undefined,
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

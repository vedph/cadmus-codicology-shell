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
import { CodSColDefinition } from '../cod-sheet-labels-part';
import { CodSColDefinitionComponent } from './cod-s-col-definition.component';

describe('CodSColDefinitionComponent', () => {
  const DEFINITION: CodSColDefinition = {
    id: 's',
    rank: 1,
    system: 'letters',
    position: 'bottom',
    note: 'a note',
  };

  async function setup(
    definition?: CodSColDefinition,
    entries?: { systems?: ThesaurusEntry[]; positions?: ThesaurusEntry[] },
  ) {
    const model = signal<CodSColDefinition | undefined>(definition);
    const editorClose = vi.fn();
    const result = await render(CodSColDefinitionComponent, {
      bindings: [
        twoWayBinding('definition', model),
        inputBinding('sysEntries', () => entries?.systems),
        inputBinding('posEntries', () => entries?.positions),
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
    expect(textbox(/^system/)).toHaveValue('letters');
    expect(textbox(/^position/)).toHaveValue('bottom');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(saveButton()).toBeDisabled();
  });

  it('should use selects when entries are provided', async () => {
    await setup(DEFINITION, {
      systems: [{ id: 'letters', value: 'Letters' }],
      positions: [{ id: 'bottom', value: 'Bottom' }],
    });

    const system = screen.getByRole('combobox', { name: /system/ });
    await waitFor(() => expect(system).toHaveTextContent('Letters'));
    expect(
      screen.getByRole('combobox', { name: /position/ }),
    ).toHaveTextContent('Bottom');
  });

  it.each([
    [/^system/, 'system required'],
    [/^position/, 'position required'],
  ])('should require %s', async (name, error) => {
    const { user } = await setup(DEFINITION);

    await user.clear(textbox(name));
    await user.tab();

    expect(screen.getByText(error)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited definition, keeping its ID', async () => {
    const { user, model } = await setup(DEFINITION);

    await user.clear(textbox(/^system/));
    await user.type(textbox(/^system/), ' numbers ');
    await user.clear(textbox(/^note/));
    await user.click(saveButton());

    expect(model()).toEqual({
      id: 's',
      rank: 1,
      system: 'numbers',
      position: 'bottom',
      links: undefined,
      note: '',
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

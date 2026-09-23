import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodHandSubscription } from '../cod-hands-part';
import { CodHandSubscriptionComponent } from './cod-hand-subscription.component';

describe('CodHandSubscriptionComponent', () => {
  const SUBSCRIPTION: CodHandSubscription = {
    ranges: [{ start: { n: 5 }, end: { n: 5 } }],
    language: 'lat',
    text: 'scripsit',
    note: 'a note',
  };

  async function setup(
    subscription?: CodHandSubscription,
    langEntries?: ThesaurusEntry[],
  ) {
    const model = signal<CodHandSubscription | undefined>(subscription);
    const editorClose = vi.fn();
    const result = await render(CodHandSubscriptionComponent, {
      bindings: [
        twoWayBinding('subscription', model),
        inputBinding('langEntries', () => langEntries),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  const saveButton = () =>
    screen.getByRole('button', { description: /accept changes/i });

  it('should show the subscription values', async () => {
    await setup(SUBSCRIPTION);

    expect(textbox(/^range/)).toHaveValue('5');
    expect(textbox(/^language/)).toHaveValue('lat');
    expect(textbox(/^text/)).toHaveValue('scripsit');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(saveButton()).toBeDisabled();
  });

  it('should use a select for language when entries are provided', async () => {
    await setup(SUBSCRIPTION, [{ id: 'lat', value: 'Latin' }]);

    const lang = screen.getByRole('combobox', { name: /language/ });
    await waitFor(() => expect(lang).toHaveTextContent('Latin'));
  });

  it('should require the language', async () => {
    const { user } = await setup(SUBSCRIPTION);

    await user.clear(textbox(/^language/));
    await user.tab();

    expect(screen.getByText('language required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should require ranges', async () => {
    const { user } = await setup({ ranges: [], language: 'lat' });

    await user.type(textbox(/^text/), 'x');

    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited subscription', async () => {
    const { user, model } = await setup(SUBSCRIPTION);

    await user.clear(textbox(/^text/));
    await user.type(textbox(/^text/), ' fecit ');
    await user.clear(textbox(/^range/));
    await user.type(textbox(/^range/), '6r');
    await new Promise((r) => setTimeout(r, 350));
    await user.click(saveButton());

    expect(model()).toEqual({
      ranges: [expect.objectContaining({ start: expect.objectContaining({ n: 6 }) })],
      language: 'lat',
      text: 'fecit',
      note: 'a note',
    });
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(SUBSCRIPTION);

    await user.click(
      screen.getByRole('button', { description: /discard changes/i }),
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

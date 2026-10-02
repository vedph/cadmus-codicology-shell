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

  // signal forms regressions

  it('should ignore child echoes of its data', async () => {
    const { fixture } = await setup(SUBSCRIPTION);

    fixture.componentInstance.onLocationChange([{ start: { n: 5 }, end: { n: 5 } }]);
    fixture.detectChanges();

    expect(saveButton()).toBeDisabled();
  });

  it('should get dirty for a real child change', async () => {
    const { fixture } = await setup(SUBSCRIPTION);

    fixture.componentInstance.onLocationChange([{ start: { n: 6 }, end: { n: 6 } }]);
    fixture.detectChanges();

    expect(saveButton()).toBeEnabled();
  });

  it('should save on Enter in a text input when dirty', async () => {
    const { user, model } = await setup(SUBSCRIPTION);

    await user.type(screen.getByRole('textbox', { name: /^language/ }), 'x{Enter}');

    expect((model() as any).language).toBe('latx');
  });

  it('should not save on Enter while pristine', async () => {
    const { user, model } = await setup(SUBSCRIPTION);

    await user.type(screen.getByRole('textbox', { name: /^language/ }), '{Enter}');

    expect(model()).toBe(SUBSCRIPTION);
  });

  it('should save without the form identity tags', async () => {
    const { user, model } = await setup(SUBSCRIPTION);

    await user.type(screen.getByRole('textbox', { name: /^language/ }), 'x');
    await user.click(saveButton());

    const check = (v: any): void => {
      if (Array.isArray(v)) v.forEach(check);
      else if (v && typeof v === 'object') {
        expect(Object.getOwnPropertySymbols(v)).toHaveLength(0);
        Object.values(v).forEach(check);
      }
    };
    check(model());
  });

  it('should render no form element', async () => {
    const { container } = await setup(SUBSCRIPTION);
    expect(container.querySelector('form')).toBeNull();
  });
});

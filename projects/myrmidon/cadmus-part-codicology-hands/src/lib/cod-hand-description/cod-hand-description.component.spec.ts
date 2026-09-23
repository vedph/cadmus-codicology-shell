import { outputBinding, signal, twoWayBinding } from '@angular/core';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  MufiRefLookupService,
  MufiService,
} from '@myrmidon/cadmus-refs-mufi-lookup';

import { CodHandDescription, CodHandSign } from '../cod-hands-part';
import { CodHandDescriptionComponent } from './cod-hand-description.component';

describe('CodHandDescriptionComponent', () => {
  const S1: CodHandSign = { eid: 'sg1', type: 'abbr', sampleLocation: { n: 3 } };
  const S2: CodHandSign = { eid: 'sg2', type: 'punct', sampleLocation: { n: 4 } };
  const DESCRIPTION: CodHandDescription = {
    key: 'main',
    description: 'a hand',
    initials: 'red initials',
    signs: [S1, S2],
  };

  async function setup(description?: CodHandDescription, confirm = true) {
    const model = signal<CodHandDescription | undefined>(description);
    const editorClose = vi.fn();
    const dialog = { confirm: vi.fn(() => of(confirm)) };
    const result = await render(CodHandDescriptionComponent, {
      bindings: [
        twoWayBinding('description', model),
        outputBinding('editorClose', editorClose),
      ],
      providers: [
        { provide: DialogService, useValue: dialog },
        { provide: MufiService, useValue: { get: () => of(undefined) } },
        {
          provide: MufiRefLookupService,
          useValue: { id: 'mufi', lookup: () => of([]), getName: () => '' },
        },
      ],
    });
    return { ...result, model, editorClose, dialog, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  const signRows = () => screen.queryAllByRole('row').slice(1);
  const signButton = (row: number, description: RegExp) =>
    within(signRows()[row]).getByRole('button', { description });
  // the description editor's own buttons are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;
  // the sign editor is inside the expansion panel region named after it
  const signEditor = () => screen.getByRole('region', { name: /sign #/ });

  it('should show the description values and signs', async () => {
    await setup(DESCRIPTION);

    expect(textbox(/^key/)).toHaveValue('main');
    expect(textbox(/^description/)).toHaveValue('a hand');
    expect(signRows()).toHaveLength(2);
    expect(within(signRows()[0]).getByText('sg1')).toBeInTheDocument();
    expect(within(signRows()[1]).getByText('punct')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited description', async () => {
    const { user, model } = await setup(DESCRIPTION);

    await user.clear(textbox(/^key/));
    await user.type(textbox(/^key/), ' k2 ');
    await user.click(saveButton());

    expect(model()).toEqual(
      expect.objectContaining({
        key: 'k2',
        description: 'a hand',
        initials: 'red initials',
        signs: [S1, S2],
      }),
    );
  });

  it('should preserve the general note when saving', async () => {
    const { user, model } = await setup({ ...DESCRIPTION, note: 'general' });

    await user.type(textbox(/^key/), '2');
    await user.click(saveButton());

    expect(model()!.note).toBe('general');
  });

  it('should save a note edited in the notes set', async () => {
    const { user, model } = await setup(DESCRIPTION);

    await user.click(screen.getByRole('combobox', { name: /note/ }));
    await user.click(await screen.findByRole('option', { name: 'punctuation' }));
    // the note set loads the selected note text after a short debounce
    await new Promise((r) => setTimeout(r, 50));
    // the note text area has no label: it is the last textbox
    const noteText = screen.getAllByRole('textbox').at(-1)!;
    await user.type(noteText, 'dots');
    await user.click(
      screen.getByRole('button', { description: /save this note/i }),
    );
    await user.click(saveButton());

    expect(model()!.punctuation).toBe('dots');
    expect(model()!.initials).toBe('red initials');
  });

  it('should add a sign', async () => {
    const { user, model } = await setup({ key: 'k' });

    await user.click(screen.getByRole('button', { name: /^sign$/ }));
    const editor = signEditor();
    await user.type(within(editor).getByRole('textbox', { name: /^type/ }), 'x');
    await user.type(
      within(editor).getByRole('textbox', { name: /^sample/ }),
      '7r',
    );
    await new Promise((r) => setTimeout(r, 350));
    await user.click(
      within(editor).getByRole('button', { description: /accept changes/i }),
    );

    expect(signRows()).toHaveLength(1);
    expect(screen.queryByRole('region', { name: /sign #/ })).toBeNull();

    await user.type(textbox(/^key/), '2');
    await user.click(saveButton());
    expect(model()!.signs).toEqual([
      expect.objectContaining({
        type: 'x',
        sampleLocation: expect.objectContaining({ n: 7 }),
      }),
    ]);
  });

  it('should edit a sign', async () => {
    const { user, model } = await setup(DESCRIPTION);

    await user.click(signButton(1, /edit this sign/i));
    const editor = signEditor();
    expect(editor).toHaveAccessibleName(/sign #2/);
    await user.type(
      within(editor).getByRole('textbox', { name: /^description/ }),
      'dsc',
    );
    await user.click(
      within(editor).getByRole('button', { description: /accept changes/i }),
    );
    await user.type(textbox(/^key/), '2');
    await user.click(saveButton());

    expect(model()!.signs![1]).toEqual(
      expect.objectContaining({ eid: 'sg2', description: 'dsc' }),
    );
  });

  it('should close the sign editor on cancel', async () => {
    const { user } = await setup(DESCRIPTION);

    await user.click(signButton(0, /edit this sign/i));
    await user.click(
      within(signEditor()).getByRole('button', {
        description: /discard changes/i,
      }),
    );

    expect(screen.queryByRole('region', { name: /sign #/ })).toBeNull();
  });

  it('should delete a sign after confirmation', async () => {
    const { user, dialog } = await setup(DESCRIPTION);

    await user.click(signButton(0, /delete this sign/i));

    expect(dialog.confirm).toHaveBeenCalled();
    expect(signRows()).toHaveLength(1);
    expect(within(signRows()[0]).getByText('sg2')).toBeInTheDocument();
  });

  it('should not delete a sign when not confirmed', async () => {
    const { user } = await setup(DESCRIPTION, false);

    await user.click(signButton(0, /delete this sign/i));

    expect(signRows()).toHaveLength(2);
  });

  it('should move signs up and down', async () => {
    const { user, model } = await setup(DESCRIPTION);

    expect(signButton(0, /move this sign up/i)).toBeDisabled();
    await user.click(signButton(0, /move this sign down/i));
    await user.click(saveButton());
    expect(model()!.signs).toEqual([S2, S1]);

    await user.click(signButton(1, /move this sign up/i));
    await user.click(saveButton());
    expect(model()!.signs).toEqual([S1, S2]);
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(DESCRIPTION);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

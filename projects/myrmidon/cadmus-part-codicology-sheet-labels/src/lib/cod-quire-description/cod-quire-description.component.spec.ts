import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { CodQuireDescription } from '../cod-sheet-labels-part';
import { CodQuireDescriptionComponent } from './cod-quire-description.component';

describe('CodQuireDescriptionComponent', () => {
  const FEATURES: ThesaurusEntry[] = [
    { id: 'reg', value: 'regular' },
    { id: 'miss', value: 'missing leaves' },
  ];
  const DESCRIPTION: CodQuireDescription = {
    features: ['reg'],
    note: 'a note',
    scopedNotes: { 2: 'second quire' },
  };

  async function setup(
    description?: CodQuireDescription,
    maxQuireNumber = 3,
  ) {
    const model = signal<CodQuireDescription | undefined>(description);
    const descriptionCancel = vi.fn();
    const result = await render(CodQuireDescriptionComponent, {
      bindings: [
        twoWayBinding('description', model),
        inputBinding('maxQuireNumber', () => maxQuireNumber),
        inputBinding('featureEntries', () => FEATURES),
        outputBinding('descriptionCancel', descriptionCancel),
      ],
      providers: [
        { provide: DialogService, useValue: { confirm: () => of(true) } },
      ],
    });
    return { ...result, model, descriptionCancel, user: userEvent.setup() };
  }

  const noteInput = () => screen.getByRole('textbox', { name: /^note$/ });
  // the nested note set has its own buttons: ours are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the description values', async () => {
    await setup(DESCRIPTION);

    expect(screen.getByRole('checkbox', { name: /regular/ })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /missing leaves/ }),
    ).not.toBeChecked();
    expect(noteInput()).toHaveValue('a note');
    expect(screen.getByText('scoped notes')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should hide scoped notes without quires', async () => {
    await setup(DESCRIPTION, 0);
    expect(screen.queryByText('scoped notes')).toBeNull();
  });

  it('should save the edited description', async () => {
    const { user, model } = await setup(DESCRIPTION);

    await user.click(screen.getByRole('checkbox', { name: /missing leaves/ }));
    await user.clear(noteInput());
    await user.click(saveButton());

    expect(model()).toEqual({
      features: ['reg', 'miss'],
      note: undefined,
      scopedNotes: { 2: 'second quire' },
    });
  });

  it('should save a scoped note', async () => {
    const { user, model } = await setup(DESCRIPTION);

    // pick the note for quire 3 in the note set
    await user.click(screen.getByRole('combobox', { name: /note/ }));
    await user.click(await screen.findByRole('option', { name: '3' }));
    // the note set loads the selected note text after a short debounce
    await new Promise((r) => setTimeout(r, 50));
    // the note set text area has no label: it is the last textbox
    await user.type(screen.getAllByRole('textbox').at(-1)!, 'third quire');
    await user.click(
      screen.getByRole('button', { description: /save this note/i }),
    );
    await user.click(saveButton());

    expect(model()!.scopedNotes).toEqual({
      2: 'second quire',
      3: 'third quire',
    });
  });

  it('should save no features and scoped notes as undefined', async () => {
    const { user, model } = await setup({ features: ['reg'] });

    await user.click(screen.getByRole('checkbox', { name: /regular/ }));
    await user.click(saveButton());

    expect(model()).toEqual({
      features: undefined,
      note: undefined,
      scopedNotes: undefined,
    });
  });

  it('should emit descriptionCancel on cancel', async () => {
    const { user, descriptionCancel } = await setup(DESCRIPTION);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(descriptionCancel).toHaveBeenCalled();
  });
});

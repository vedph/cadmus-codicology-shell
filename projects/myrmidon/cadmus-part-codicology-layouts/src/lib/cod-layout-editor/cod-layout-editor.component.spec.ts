import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { CodLayout } from '../cod-layouts-part';
import { CodLayoutEditorComponent } from './cod-layout-editor.component';

describe('CodLayoutEditorComponent', () => {
  const FORMULA = '200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15';
  const LAYOUT: CodLayout = {
    sample: { n: 11 },
    ranges: [{ start: { n: 10 }, end: { n: 20 } }],
    columnCount: 2,
    tag: 'main',
    note: 'a note',
    derolez: 'd1',
    pricking: 'p1',
  };

  async function setup(
    layout?: CodLayout,
    entries?: { rulings?: ThesaurusEntry[] },
  ) {
    const model = signal<CodLayout | undefined>(layout);
    const editorClose = vi.fn();
    const snackbar = { open: vi.fn() };
    const result = await render(CodLayoutEditorComponent, {
      bindings: [
        twoWayBinding('layout', model),
        inputBinding('rulTechEntries', () => entries?.rulings),
        outputBinding('editorClose', editorClose),
      ],
      providers: [
        { provide: DialogService, useValue: { confirm: () => of(true) } },
      ],
      configureTestBed: (tb) =>
        tb.overrideProvider(MatSnackBar, { useValue: snackbar }),
    });
    return {
      ...result,
      model,
      editorClose,
      snackbar,
      user: userEvent.setup(),
    };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  // the layout editor form (the formula editor is outside of it)
  const editorForm = () => textbox(/^note/).closest('form')!;
  const saveButton = () =>
    within(editorForm()).getByRole('button', {
      description: /accept changes/i,
    });

  it('should show the layout values', async () => {
    await setup(LAYOUT);

    expect(textbox(/^tag/)).toHaveValue('main');
    expect(textbox(/^sample/)).toHaveValue('11');
    expect(textbox(/^range/)).toHaveValue('10-20');
    expect(textbox(/^derolez/)).toHaveValue('d1');
    expect(textbox(/^pricking/)).toHaveValue('p1');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(screen.getByRole('spinbutton', { name: /cols/ })).toHaveValue(2);
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited layout', async () => {
    const { user, model } = await setup(LAYOUT);

    const cols = screen.getByRole('spinbutton', { name: /cols/ });
    await user.clear(cols);
    await user.type(cols, '3');
    await user.clear(textbox(/^note/));
    await user.type(textbox(/^note/), ' new ');
    await user.click(saveButton());

    expect(model()).toEqual({
      sample: { n: 11 },
      ranges: LAYOUT.ranges,
      formula: undefined,
      dimensions: [],
      rulingTechniques: undefined,
      derolez: 'd1',
      pricking: 'p1',
      columnCount: 3,
      counts: undefined,
      tag: 'main',
      note: 'new',
    });
  });

  it('should not save without ranges', async () => {
    const { user } = await setup({ ranges: [], columnCount: 1 });

    await user.type(textbox(/^note/), 'x');

    expect(saveButton()).toBeDisabled();
  });

  it('should show rulings only when entries are provided', async () => {
    await setup(LAYOUT);
    expect(screen.queryByText('rulings')).toBeNull();
  });

  it('should toggle ruling techniques', async () => {
    const { user, model } = await setup(LAYOUT, {
      rulings: [
        { id: 'dry', value: 'dry point' },
        { id: 'ink', value: 'ink' },
      ],
    });

    expect(screen.getByText('rulings')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /dry point/ }));
    await user.click(saveButton());

    expect(model()!.rulingTechniques).toEqual(['dry']);
  });

  it('should include the formula edited in the formula editor', async () => {
    const { user, model, snackbar } = await setup(LAYOUT);

    await user.click(textbox(/^formula/));
    await user.paste(FORMULA);
    // the formula editor accept button is the last one
    await user.click(
      screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
    );
    expect(snackbar.open).toHaveBeenCalledWith(
      'Formula updated',
      'OK',
      expect.anything(),
    );

    // the formula change alone makes the layout savable
    expect(saveButton()).toBeEnabled();
    await user.click(saveButton());

    expect(model()!.formula).toBe(FORMULA);
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(LAYOUT);

    await user.click(
      within(editorForm()).getByRole('button', {
        description: /discard changes/i,
      }),
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

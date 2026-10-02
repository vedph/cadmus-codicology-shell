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
  const editorForm = () => textbox(/^note/).closest('#editor') as HTMLElement;
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

  // signal forms regressions

  it('should ignore child echoes of its data', async () => {
    const { fixture } = await setup(LAYOUT);

    fixture.componentInstance.onCountsChange([]);
    fixture.componentInstance.onCheckedIdsChange([]);
    fixture.componentInstance.onRangeLocationChange([{ start: { n: 10 }, end: { n: 20 } }]);
    fixture.detectChanges();

    expect(saveButton()).toBeDisabled();
  });

  it('should get dirty for a real child change', async () => {
    const { fixture } = await setup(LAYOUT);

    fixture.componentInstance.onCheckedIdsChange(['pen']);
    fixture.detectChanges();

    expect(saveButton()).toBeEnabled();
  });

  it('should save on Enter in a text input when dirty', async () => {
    const { user, model } = await setup(LAYOUT);

    await user.type(textbox(/^tag/), 'x{Enter}');

    expect((model() as any).tag).toBe('mainx');
  });

  it('should not save on Enter while pristine', async () => {
    const { user, model } = await setup(LAYOUT);

    await user.type(textbox(/^tag/), '{Enter}');

    expect(model()).toBe(LAYOUT);
  });

  it('should save without the form identity tags', async () => {
    const { user, model } = await setup(LAYOUT);

    await user.type(textbox(/^tag/), 'x');
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
    const { container } = await setup(LAYOUT);
    expect(container.querySelector('form')).toBeNull();
  });

  it('should save the dimensions of the nested formula editor without ordinals', async () => {
    const { user, model, fixture } = await setup({ ...LAYOUT, formula: FORMULA });

    // in the nested formula editor: import its dimensions and accept
    await user.click(
      screen.getAllByRole('button', { description: /import dimensions/i })[0],
    );
    await user.click(
      screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
    );
    // the formula editor gets back the data without ordinals, and stays
    // pristine (it does not take that for new data)
    expect(
      screen.getAllByRole('button', { description: /accept changes/i }).at(-1),
    ).toBeDisabled();
    expect(fixture.componentInstance.form().dirty()).toBe(true);

    await user.click(saveButton());

    expect(model()!.dimensions!.length).toBe(10);
    for (const d of model()!.dimensions!) {
      expect('ordinal' in d).toBe(false);
    }
  });

  it('should keep an ordinal edited in the nested formula editor after accepting it', async () => {
    const { user } = await setup({
      ...LAYOUT,
      formula: FORMULA,
      dimensions: [{ tag: 'custom', value: 1, unit: 'mm' }],
    });

    // in the nested formula editor: set the ordinal of the custom dimension
    await user.click(screen.getByRole('button', { name: /^dimensions/i }));
    await user.click(
      screen.getByRole('button', { description: /edit ordinal/i }),
    );
    const ordinal = screen.getByRole('spinbutton', { name: /value/i });
    await user.clear(ordinal);
    await user.type(ordinal, '1');
    await user.click(
      within(ordinal.closest('.form-row') as HTMLElement).getByRole('button', {
        description: /accept changes/i,
      }),
    );
    // accept the formula: the layout editor binds back its data without
    // ordinals, which must not rebuild the formula editor
    await user.click(
      screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
    );

    const row = screen
      .getAllByRole('row')
      .find((r) => within(r).queryByText('custom', { exact: true }))!;
    const cells = within(row).getAllByRole('cell');
    expect(cells[cells.length - 1].textContent).toMatch(/^\s*1\s/);
  });
});

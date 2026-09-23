import { outputBinding, signal, twoWayBinding } from '@angular/core';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { DialogService } from '@myrmidon/ngx-mat-tools';

import {
  CodLayoutFormulaComponent,
  CodLayoutFormulaWithDimensions,
} from './cod-layout-formula.component';

const FORMULA = '200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15';

describe('CodLayoutFormulaComponent', () => {
  async function setup(
    data?: CodLayoutFormulaWithDimensions,
    confirm: boolean = true,
  ) {
    const model = signal<CodLayoutFormulaWithDimensions | undefined>(data);
    const cancelEdit = vi.fn();
    const dialogService = { confirm: vi.fn(() => of(confirm)) };
    const result = await render(CodLayoutFormulaComponent, {
      bindings: [
        twoWayBinding('data', model),
        outputBinding('cancelEdit', cancelEdit),
      ],
      providers: [{ provide: DialogService, useValue: dialogService }],
    });
    const user = userEvent.setup();
    // dimensions are inside a collapsed expansion panel
    await user.click(screen.getByRole('button', { name: /dimensions/i }));
    return {
      ...result,
      model,
      cancelEdit,
      dialogService,
      user,
    };
  }

  const getFormulaInput = () =>
    screen.getByRole('textbox', { name: /formula/i }) as HTMLInputElement;
  const getSaveButton = () =>
    screen.getByRole('button', { description: /accept changes/i });
  /** Data rows of the dimensions table (excluding the header row). */
  const getDimensionRows = () => screen.getAllByRole('row').slice(1);
  const rowFor = (tag: string) =>
    getDimensionRows().find((r) => within(r).queryByText(tag, { exact: true }))!;

  it('should show the formula and its hint', async () => {
    await setup({ formula: FORMULA, dimensions: [] });

    expect(getFormulaInput()).toHaveValue(FORMULA);
    expect(screen.getByText(/250 × 160 = 30/)).toBeInTheDocument();
  });

  it('should show an error for an invalid formula', async () => {
    const { user } = await setup({ formula: FORMULA, dimensions: [] });

    await user.clear(getFormulaInput());
    await user.type(getFormulaInput(), 'garbage');
    await user.tab();

    expect(screen.getByText(/invalid formula/i)).toBeInTheDocument();
    expect(getSaveButton()).toBeDisabled();
  });

  it('should show a required error for an empty formula', async () => {
    const { user } = await setup({ formula: FORMULA, dimensions: [] });

    await user.clear(getFormulaInput());
    await user.tab();

    expect(screen.getByText(/formula required/i)).toBeInTheDocument();
  });

  it('should list the dimensions and their count', async () => {
    await setup({
      formula: FORMULA,
      dimensions: [
        { tag: 'height', value: 200, unit: 'mm' },
        { tag: 'width', value: 160, unit: 'mm' },
        { tag: 'margin-top', value: 30, unit: 'mm' },
      ],
    });

    expect(getDimensionRows()).toHaveLength(3);
    expect(within(rowFor('margin-top')).getByText('30')).toBeInTheDocument();
  });

  it('should import dimensions from the formula', async () => {
    const { user } = await setup({ formula: FORMULA, dimensions: [] });

    await user.click(
      screen.getAllByRole('button', { description: /import dimensions/i })[0],
    );

    // height, width + 8 labeled spans
    expect(getDimensionRows()).toHaveLength(10);
    expect(within(rowFor('col-1-width')).getByText('60')).toBeInTheDocument();
    expect(within(rowFor('height')).getByText('200')).toBeInTheDocument();
  });

  it('should keep custom dimensions when importing from the formula', async () => {
    const { user } = await setup({
      formula: FORMULA,
      dimensions: [{ tag: 'custom', value: 1, unit: 'mm' }],
    });

    await user.click(
      screen.getAllByRole('button', { description: /import dimensions/i })[0],
    );

    expect(getDimensionRows()).toHaveLength(11);
    expect(rowFor('custom')).toBeTruthy();
  });

  it('should save formula and dimensions into data', async () => {
    const { user, model } = await setup({
      prefix: 'IT',
      formula: FORMULA,
      dimensions: [],
    });

    await user.click(
      screen.getAllByRole('button', { description: /import dimensions/i })[0],
    );
    await user.click(getSaveButton());

    const saved = model()!;
    expect(saved.prefix).toBe('IT');
    expect(saved.formula).toBe(FORMULA);
    expect(saved.dimensions.map((d) => d.tag)).toContain('margin-top');
    expect(saved.dimensions.find((d) => d.tag === 'height')?.value).toBe(200);
  });

  it('should delete a dimension after confirmation', async () => {
    const { user, dialogService } = await setup({
      formula: FORMULA,
      dimensions: [
        { tag: 'height', value: 200, unit: 'mm' },
        { tag: 'custom', value: 1, unit: 'mm' },
      ],
    });

    await user.click(
      within(rowFor('custom')).getByRole('button', {
        description: /delete this dimension/i,
      }),
    );

    expect(dialogService.confirm).toHaveBeenCalled();
    expect(getDimensionRows()).toHaveLength(1);
    expect(screen.queryByText('custom')).not.toBeInTheDocument();
  });

  it('should not delete a dimension when not confirmed', async () => {
    const { user } = await setup(
      {
        formula: FORMULA,
        dimensions: [{ tag: 'custom', value: 1, unit: 'mm' }],
      },
      false,
    );

    await user.click(
      screen.getByRole('button', { description: /delete this dimension/i }),
    );

    expect(getDimensionRows()).toHaveLength(1);
  });

  it('should move dimensions up and down', async () => {
    const { user } = await setup({
      formula: FORMULA,
      dimensions: [
        { tag: 'a', value: 1, unit: 'mm' },
        { tag: 'b', value: 2, unit: 'mm' },
      ],
    });
    const tags = () =>
      getDimensionRows().map((r) => within(r).getAllByRole('cell')[1].textContent);

    expect(
      within(getDimensionRows()[0]).getByRole('button', {
        description: /move this dimension up/i,
      }),
    ).toBeDisabled();

    await user.click(
      within(getDimensionRows()[0]).getByRole('button', {
        description: /move this dimension down/i,
      }),
    );
    expect(tags()).toEqual(['b', 'a']);

    await user.click(
      within(getDimensionRows()[1]).getByRole('button', {
        description: /move this dimension up/i,
      }),
    );
    expect(tags()).toEqual(['a', 'b']);
  });

  it('should update the formula when moving span dimensions', async () => {
    const { user } = await setup({ formula: FORMULA, dimensions: [] });
    await user.click(
      screen.getAllByRole('button', { description: /import dimensions/i })[0],
    );

    // swap margin-top (30) and area-height (130): their ordinals are swapped
    // and the formula gets rebuilt accordingly
    const rows = getDimensionRows();
    const index = rows.indexOf(rowFor('area-height'));
    await user.click(
      within(rows[index]).getByRole('button', {
        description: /move this dimension up/i,
      }),
    );

    expect(getFormulaInput().value).not.toBe(FORMULA);
    expect(getFormulaInput().value).toMatch(/^200 × 160 = 130/);
  });

  it('should open the dimension editor when adding a dimension', async () => {
    const { user } = await setup({ formula: FORMULA, dimensions: [] });

    await user.click(
      screen.getByRole('button', { description: /add dimension/i }),
    );

    expect(screen.getByText('dimension #0')).toBeInTheDocument();
  });

  it('should open the dimension editor when editing a dimension', async () => {
    const { user } = await setup({
      formula: FORMULA,
      dimensions: [{ tag: 'custom', value: 1, unit: 'mm' }],
    });

    await user.click(
      screen.getByRole('button', { description: /edit this dimension/i }),
    );

    expect(screen.getByText('dimension #1')).toBeInTheDocument();
  });

  it('should edit a dimension ordinal', async () => {
    const { user, model } = await setup({
      formula: FORMULA,
      dimensions: [{ tag: 'custom', value: 1, unit: 'mm' }],
    });

    await user.click(
      screen.getByRole('button', { description: /edit ordinal/i }),
    );
    const ordinalInput = screen.getByRole('spinbutton', { name: /value/i });
    expect(ordinalInput).toHaveValue(0);

    await user.clear(ordinalInput);
    await user.type(ordinalInput, '1');
    // the ordinal editor's accept button comes first in document order
    await user.click(
      screen.getAllByRole('button', { description: /accept changes/i })[0],
    );

    expect(
      screen.queryByRole('spinbutton', { name: /value/i }),
    ).not.toBeInTheDocument();
    const cells = within(getDimensionRows()[0]).getAllByRole('cell');
    expect(cells[cells.length - 1].textContent).toMatch(/^\s*1\s/);

    await user.click(getSaveButton());
    expect(
      (model()!.dimensions[0] as unknown as { ordinal: number }).ordinal,
    ).toBe(1);
  });

  it('should close the ordinal editor on cancel', async () => {
    const { user } = await setup({
      formula: FORMULA,
      dimensions: [{ tag: 'custom', value: 1, unit: 'mm' }],
    });

    await user.click(
      screen.getByRole('button', { description: /edit ordinal/i }),
    );
    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i })[0],
    );

    expect(
      screen.queryByRole('spinbutton', { name: /value/i }),
    ).not.toBeInTheDocument();
  });

  it('should emit cancelEdit when discarding', async () => {
    const { user, cancelEdit } = await setup({
      formula: FORMULA,
      dimensions: [],
    });

    await user.click(
      screen.getByRole('button', { description: /discard changes/i }),
    );

    expect(cancelEdit).toHaveBeenCalled();
  });
});

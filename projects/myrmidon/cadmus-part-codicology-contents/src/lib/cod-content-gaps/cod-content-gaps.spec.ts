import { inputBinding, signal, twoWayBinding } from '@angular/core';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodContentGap } from '../cod-contents-part';
import { CodContentGapsComponent } from './cod-content-gaps.component';

describe('CodContentGapsComponent', () => {
  const G1: CodContentGap = {
    start: { citation: 'Inf.1.10', type: 'loss' },
    end: { citation: 'Inf.1.20', type: 'loss' },
  };
  const G2: CodContentGap = {
    start: { citation: 'Inf.2.1' },
    end: { citation: 'Inf.2.5' },
  };
  const TYPES: ThesaurusEntry[] = [{ id: 'loss', value: 'lost leaf' }];

  async function setup(gaps?: CodContentGap[]) {
    const model = signal<CodContentGap[] | undefined>(gaps);
    const result = await render(CodContentGapsComponent, {
      bindings: [
        twoWayBinding('gaps', model),
        inputBinding('gapTypeEntries', () => TYPES),
      ],
    });
    return { ...result, model, user: userEvent.setup() };
  }

  const rows = () => screen.queryAllByRole('row').slice(1);
  const rowButton = (row: number, description: RegExp) =>
    within(rows()[row]).getByRole('button', { description });
  const addButton = () => screen.getByRole('button', { name: /^gap$/ });
  const saveGapButton = () =>
    screen.getByRole('button', { description: /save gap/i });

  /** Set the start or end reference citation via the reference editor. */
  async function setRef(
    user: ReturnType<typeof userEvent.setup>,
    which: 'start' | 'end',
    citation: string,
  ) {
    await user.click(
      screen.getByRole('button', {
        description: new RegExp(`edit ${which} reference`, 'i'),
      }),
    );
    const input = screen.getByRole('textbox', { name: /^citation/ });
    await user.clear(input);
    await user.type(input, citation);
    await user.click(
      screen.getByRole('button', { description: /accept changes/i }),
    );
  }

  it('should list gaps with their types', async () => {
    await setup([G1, G2]);

    expect(rows()).toHaveLength(2);
    expect(within(rows()[0]).getByText('Inf.1.10')).toBeInTheDocument();
    expect(within(rows()[0]).getAllByText('lost leaf')).toHaveLength(2);
    expect(within(rows()[1]).getByText('Inf.2.5')).toBeInTheDocument();
  });

  it('should add a new gap', async () => {
    const { user, model } = await setup([G1]);

    await user.click(addButton());
    expect(screen.getByText('new gap')).toBeInTheDocument();
    expect(addButton()).toBeDisabled();
    expect(saveGapButton()).toBeDisabled();

    await setRef(user, 'start', 'Par.1.1');
    expect(saveGapButton()).toBeDisabled();
    await setRef(user, 'end', 'Par.1.9');
    await user.click(saveGapButton());

    expect(rows()).toHaveLength(2);
    expect(screen.queryByText('new gap')).toBeNull();
    expect(model()).toEqual([
      G1,
      {
        start: expect.objectContaining({ citation: 'Par.1.1' }),
        end: expect.objectContaining({ citation: 'Par.1.9' }),
      },
    ]);
  });

  it('should edit an existing gap', async () => {
    const { user, model } = await setup([G1, G2]);

    await user.click(rowButton(1, /edit this gap/i));
    expect(screen.getByText('gap #2')).toBeInTheDocument();

    await setRef(user, 'end', 'Inf.2.6');
    await user.click(saveGapButton());

    expect(model()![1].end.citation).toBe('Inf.2.6');
    expect(model()![0]).toEqual(G1);
  });

  it('should cancel a gap edit', async () => {
    const { user, model } = await setup([G1]);

    await user.click(rowButton(0, /edit this gap/i));
    await user.click(
      screen.getByRole('button', { description: /cancel gap edit/i }),
    );

    expect(screen.queryByText('gap #1')).toBeNull();
    expect(model()).toEqual([G1]);
  });

  it('should remove a gap', async () => {
    const { user, model } = await setup([G1, G2]);

    await user.click(rowButton(0, /delete this gap/i));

    expect(rows()).toHaveLength(1);
    expect(model()).toEqual([G2]);
  });

  it('should move gaps up and down', async () => {
    const { user, model } = await setup([G1, G2]);

    expect(rowButton(0, /move this gap up/i)).toBeDisabled();
    expect(rowButton(1, /move this gap down/i)).toBeDisabled();

    await user.click(rowButton(0, /move this gap down/i));
    expect(model()).toEqual([G2, G1]);

    await user.click(rowButton(1, /move this gap up/i));
    expect(model()).toEqual([G1, G2]);
  });

  it('should disable list actions while editing', async () => {
    const { user } = await setup([G1, G2]);

    await user.click(rowButton(0, /edit this gap/i));

    expect(rowButton(1, /delete this gap/i)).toBeDisabled();
    expect(rowButton(1, /edit this gap/i)).toBeDisabled();
  });

  it('should reflect external changes to gaps', async () => {
    const { model, fixture } = await setup([G1]);

    model.set([G1, G2]);
    fixture.detectChanges();

    expect(rows()).toHaveLength(2);
  });
});

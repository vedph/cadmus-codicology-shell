import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  MufiRefLookupService,
  MufiService,
} from '@myrmidon/cadmus-refs-mufi-lookup';

import {
  CodHand,
  CodHandDescription,
  CodHandInstance,
  CodHandSubscription,
} from '../cod-hands-part';
import { CodHandComponent } from './cod-hand.component';

describe('CodHandComponent', () => {
  const SCRIPTS: ThesaurusEntry[] = [
    { id: 'goth', value: 'Gothic' },
    { id: 'hum', value: 'Humanistic' },
  ];
  const I1: CodHandInstance = {
    scripts: ['goth'],
    typologies: ['book'],
    ranges: [{ start: { n: 1 }, end: { n: 5 } }],
  };
  const I2: CodHandInstance = {
    scripts: ['hum'],
    typologies: ['book'],
    ranges: [{ start: { n: 6 }, end: { n: 9 } }],
  };
  const D1: CodHandDescription = { key: 'alpha', description: 'first' };
  const D2: CodHandDescription = { key: 'beta' };
  const S1: CodHandSubscription = {
    ranges: [{ start: { n: 9 }, end: { n: 9 } }],
    language: 'lat',
  };
  const HAND: CodHand = {
    eid: 'h1',
    name: 'Hand A',
    instances: [I1, I2],
    descriptions: [D1, D2],
    subscriptions: [S1],
  };

  async function setup(hand?: CodHand, confirm = true) {
    const model = signal<CodHand | undefined>(hand);
    const editorClose = vi.fn();
    const dialog = { confirm: vi.fn(() => of(confirm)) };
    const result = await render(CodHandComponent, {
      bindings: [
        twoWayBinding('hand', model),
        inputBinding('scriptEntries', () => SCRIPTS),
        inputBinding('typeEntries', () => [{ id: 'book', value: 'book' }]),
        inputBinding('subLangEntries', () => [{ id: 'lat', value: 'Latin' }]),
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
  // the hand editor's own buttons are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;
  const panelButton = (name: RegExp) => screen.getByRole('button', { name });
  const region = (name: RegExp) => screen.getByRole('region', { name });
  // rows of the table inside the specified region, excluding the header
  const rowsIn = (name: RegExp) =>
    within(within(region(name)).getAllByRole('table')[0])
      .getAllByRole('row')
      .slice(1);

  it('should show the hand values and counts', async () => {
    await setup(HAND);

    expect(textbox(/^EID/)).toHaveValue('h1');
    expect(textbox(/^name/)).toHaveValue('Hand A');
    expect(panelButton(/^descriptions\s*2/)).toBeInTheDocument();
    expect(panelButton(/^instances\s*2/)).toBeInTheDocument();
    expect(panelButton(/^subscriptions\s*1/)).toBeInTheDocument();
    expect(panelButton(/^references\s*0/)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited hand', async () => {
    const { user, model } = await setup(HAND);

    await user.clear(textbox(/^name/));
    await user.type(textbox(/^name/), ' Hand B ');
    await user.click(saveButton());

    expect(model()).toEqual({
      eid: 'h1',
      name: 'Hand B',
      ids: undefined,
      descriptions: [D1, D2],
      instances: [I1, I2],
      subscriptions: [S1],
      references: undefined,
    });
  });

  it('should require at least one instance', async () => {
    const { user } = await setup({ instances: [], descriptions: [] });

    await user.type(textbox(/^name/), 'x');

    expect(saveButton()).toBeDisabled();
  });

  describe('descriptions', () => {
    const openPanel = async (user: ReturnType<typeof userEvent.setup>) =>
      user.click(panelButton(/^descriptions/));

    it('should list descriptions', async () => {
      const { user } = await setup(HAND);
      await openPanel(user);

      const rows = rowsIn(/^descriptions/);
      expect(rows).toHaveLength(2);
      expect(within(rows[0]).getByText('alpha')).toBeInTheDocument();
    });

    it('should add a description', async () => {
      const { user, model } = await setup(HAND);
      await openPanel(user);

      await user.click(screen.getByRole('button', { name: /^description$/ }));
      const editor = region(/description #0/);
      await user.type(
        within(editor).getByRole('textbox', { name: /^key/ }),
        'gamma',
      );
      await user.click(
        within(editor)
          .getAllByRole('button', { description: /accept changes/i })
          .at(-1)!,
      );

      expect(rowsIn(/^descriptions/)).toHaveLength(3);
      await user.type(textbox(/^name/), '!');
      await user.click(saveButton());
      expect(model()!.descriptions[2]).toEqual(
        expect.objectContaining({ key: 'gamma' }),
      );
    });

    it('should offer description keys to instances', async () => {
      const { user } = await setup(HAND);
      await user.click(panelButton(/^instances/));

      await user.click(
        within(rowsIn(/^instances/)[0]).getByRole('button', {
          description: /edit this instance/i,
        }),
      );
      await user.click(screen.getByRole('combobox', { name: /dsc\.key/ }));

      expect(
        await screen.findByRole('option', { name: 'alpha' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'beta' })).toBeInTheDocument();
    });

    it('should delete a description after confirmation', async () => {
      const { user, dialog } = await setup(HAND);
      await openPanel(user);

      await user.click(
        within(rowsIn(/^descriptions/)[0]).getByRole('button', {
          description: /delete this description/i,
        }),
      );

      expect(dialog.confirm).toHaveBeenCalled();
      expect(rowsIn(/^descriptions/)).toHaveLength(1);
    });

    it('should move descriptions', async () => {
      const { user, model } = await setup(HAND);
      await openPanel(user);

      await user.click(
        within(rowsIn(/^descriptions/)[0]).getByRole('button', {
          description: /move this description down/i,
        }),
      );
      await user.click(saveButton());
      expect(model()!.descriptions).toEqual([D2, D1]);

      await user.click(
        within(rowsIn(/^descriptions/)[1]).getByRole('button', {
          description: /move this description up/i,
        }),
      );
      await user.click(saveButton());
      expect(model()!.descriptions).toEqual([D1, D2]);
    });
  });

  describe('instances', () => {
    const openPanel = async (user: ReturnType<typeof userEvent.setup>) =>
      user.click(panelButton(/^instances/));

    it('should list instances with their first script', async () => {
      const { user } = await setup(HAND);
      await openPanel(user);

      const rows = rowsIn(/^instances/);
      expect(rows).toHaveLength(2);
      expect(within(rows[0]).getByText('Gothic')).toBeInTheDocument();
      expect(within(rows[1]).getByText('Humanistic')).toBeInTheDocument();
    });

    it('should edit an instance', async () => {
      const { user, model } = await setup(HAND);
      await openPanel(user);

      await user.click(
        within(rowsIn(/^instances/)[1]).getByRole('button', {
          description: /edit this instance/i,
        }),
      );
      const editor = region(/instance #2/);
      const rank = within(editor).getByRole('spinbutton', { name: /rank/ });
      await user.clear(rank);
      await user.type(rank, '4');
      await user.click(
        within(editor)
          .getAllByRole('button', { description: /accept changes/i })
          .at(-1)!,
      );
      await user.type(textbox(/^name/), '!');
      await user.click(saveButton());

      expect(model()!.instances[1]).toEqual(
        expect.objectContaining({ scripts: ['hum'], rank: 4 }),
      );
    });

    it('should close the instance editor on cancel', async () => {
      const { user } = await setup(HAND);
      await openPanel(user);

      await user.click(
        within(rowsIn(/^instances/)[0]).getByRole('button', {
          description: /edit this instance/i,
        }),
      );
      await user.click(
        within(region(/instance #1/))
          .getAllByRole('button', { description: /discard changes/i })
          .at(-1)!,
      );

      expect(screen.queryByRole('region', { name: /instance #1/ })).toBeNull();
    });

    it('should not delete an instance when not confirmed', async () => {
      const { user } = await setup(HAND, false);
      await openPanel(user);

      await user.click(
        within(rowsIn(/^instances/)[0]).getByRole('button', {
          description: /delete this instance/i,
        }),
      );

      expect(rowsIn(/^instances/)).toHaveLength(2);
    });

    it('should move instances', async () => {
      const { user, model } = await setup(HAND);
      await openPanel(user);

      await user.click(
        within(rowsIn(/^instances/)[1]).getByRole('button', {
          description: /move this instance up/i,
        }),
      );
      await user.click(saveButton());

      expect(model()!.instances).toEqual([I2, I1]);
    });
  });

  describe('subscriptions', () => {
    const openPanel = async (user: ReturnType<typeof userEvent.setup>) =>
      user.click(panelButton(/^subscriptions/));

    it('should list subscriptions with language', async () => {
      const { user } = await setup(HAND);
      await openPanel(user);

      expect(
        within(rowsIn(/^subscriptions/)[0]).getByText('Latin'),
      ).toBeInTheDocument();
    });

    it('should add a subscription with default language', async () => {
      const { user, model } = await setup(HAND);
      await openPanel(user);

      await user.click(screen.getByRole('button', { name: /^subscription$/ }));
      const editor = region(/subscription #0/);
      await user.type(
        within(editor).getByRole('textbox', { name: /^range/ }),
        '10r',
      );
      await new Promise((r) => setTimeout(r, 350));
      await user.click(
        within(editor).getByRole('button', { description: /accept changes/i }),
      );
      await user.type(textbox(/^name/), '!');
      await user.click(saveButton());

      expect(model()!.subscriptions).toHaveLength(2);
      expect(model()!.subscriptions![1].language).toBe('lat');
    });

    it('should delete a subscription, saving none as undefined', async () => {
      const { user, model } = await setup(HAND);
      await openPanel(user);

      await user.click(
        within(rowsIn(/^subscriptions/)[0]).getByRole('button', {
          description: /delete this subscription/i,
        }),
      );
      await user.click(saveButton());

      expect(model()!.subscriptions).toBeUndefined();
    });
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(HAND);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

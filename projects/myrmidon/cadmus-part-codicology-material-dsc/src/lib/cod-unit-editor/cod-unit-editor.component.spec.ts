import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodUnit } from '../cod-material-dsc-part';
import { CodUnitEditorComponent } from './cod-unit-editor.component';

describe('CodUnitEditorComponent', () => {
  const UNIT: CodUnit = {
    eid: 'u1',
    tag: 'main',
    material: 'parch',
    format: 'fol',
    state: 'good',
    ranges: [{ start: { n: 1 }, end: { n: 10 } }],
    noGregory: true,
    note: 'a note',
  };

  async function setup(
    unit?: CodUnit,
    entries?: {
      materials?: ThesaurusEntry[];
      formats?: ThesaurusEntry[];
      states?: ThesaurusEntry[];
      // format is hidden by default: show it unless specified
      noFormat?: boolean;
    },
  ) {
    const model = signal<CodUnit | undefined>(unit);
    const editorClose = vi.fn();
    const result = await render(CodUnitEditorComponent, {
      bindings: [
        twoWayBinding('unit', model),
        inputBinding('materialEntries', () => entries?.materials),
        inputBinding('formatEntries', () => entries?.formats),
        inputBinding('stateEntries', () => entries?.states),
        inputBinding('noFormat', () => entries?.noFormat ?? false),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  // nested editors have their own buttons: ours are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the unit values', async () => {
    await setup(UNIT);

    expect(textbox(/^EID/)).toHaveValue('u1');
    expect(textbox(/^tag/)).toHaveValue('main');
    expect(textbox(/^material/)).toHaveValue('parch');
    expect(textbox(/^format/)).toHaveValue('fol');
    expect(textbox(/^state/)).toHaveValue('good');
    expect(textbox(/^range/)).toHaveValue('1-10');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(screen.getByRole('checkbox', { name: /no Gregory/ })).toBeChecked();
    expect(saveButton()).toBeDisabled();
  });

  it('should require material', async () => {
    const { user } = await setup(UNIT);

    await user.clear(textbox(/^material/));
    await user.tab();

    expect(screen.getByText('material required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save a unit without format', async () => {
    const { user, model } = await setup(UNIT);

    await user.clear(textbox(/^format/));
    await user.tab();
    expect(screen.queryByText(/format required/)).toBeNull();
    await user.click(saveButton());

    expect(model()).toEqual({
      ...UNIT,
      format: undefined,
      chronotopes: undefined,
    });
  });

  it('should use selects when entries are provided', async () => {
    await setup(UNIT, {
      materials: [{ id: 'parch', value: 'parchment' }],
      formats: [{ id: 'fol', value: 'folio' }],
      states: [{ id: 'good', value: 'good state' }],
    });

    const material = screen.getByRole('combobox', { name: /material/ });
    await waitFor(() => expect(material).toHaveTextContent('parchment'));
    expect(screen.getByRole('combobox', { name: /format/ })).toHaveTextContent(
      'folio',
    );
    expect(screen.getByRole('combobox', { name: /state/ })).toHaveTextContent(
      'good state',
    );
  });

  it('should save the edited unit', async () => {
    const { user, model } = await setup(UNIT);

    await user.clear(textbox(/^state/));
    await user.type(textbox(/^state/), ' worn ');
    await user.click(screen.getByRole('checkbox', { name: /no Gregory/ }));
    await user.click(saveButton());

    expect(model()).toEqual({
      ...UNIT,
      state: 'worn',
      noGregory: false,
      chronotopes: undefined,
    });
  });

  it('should save edited ranges', async () => {
    const { user, model } = await setup(UNIT);

    await user.clear(textbox(/^range/));
    await user.type(textbox(/^range/), '2r-3v');
    await new Promise((r) => setTimeout(r, 350));
    await user.click(saveButton());

    expect(model()!.ranges[0].start.n).toBe(2);
    expect(model()!.ranges[0].end.n).toBe(3);
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(UNIT);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });

  // signal forms regressions

  it('should ignore child echoes of its data', async () => {
    const { fixture } = await setup(UNIT);

    fixture.componentInstance.onChronotopesChange([]);
    fixture.componentInstance.onLocationChange([{ start: { n: 1 }, end: { n: 10 } }]);
    fixture.detectChanges();

    expect(saveButton()).toBeDisabled();
  });

  it('should get dirty for a real child change', async () => {
    const { fixture } = await setup(UNIT);

    fixture.componentInstance.onLocationChange([{ start: { n: 2 }, end: { n: 10 } }]);
    fixture.detectChanges();

    expect(saveButton()).toBeEnabled();
  });

  it('should save on Enter in a text input when dirty', async () => {
    const { user, model } = await setup(UNIT);

    await user.type(textbox(/^EID/), 'x{Enter}');

    expect((model() as any).eid).toBe('u1x');
  });

  it('should not save on Enter while pristine', async () => {
    const { user, model } = await setup(UNIT);

    await user.type(textbox(/^EID/), '{Enter}');

    expect(model()).toBe(UNIT);
  });

  it('should save without the form identity tags', async () => {
    const { user, model } = await setup(UNIT);

    await user.type(textbox(/^EID/), 'x');
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
    const { container } = await setup(UNIT);
    expect(container.querySelector('form')).toBeNull();
  });

  it('should hide the format by default', async () => {
    // noFormat not bound
    await render(CodUnitEditorComponent, {
      bindings: [twoWayBinding('unit', signal<CodUnit | undefined>(UNIT))],
    });
    expect(screen.queryByRole('textbox', { name: /^format/ })).toBeNull();
  });

  it('should not accept a unit without ranges', async () => {
    // Validators.required flagged an empty array; required() does not
    const { fixture } = await setup(UNIT);

    fixture.componentInstance.onLocationChange([]);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.ranges().invalid()).toBe(true);
    expect(saveButton()).toBeDisabled();
  });
});

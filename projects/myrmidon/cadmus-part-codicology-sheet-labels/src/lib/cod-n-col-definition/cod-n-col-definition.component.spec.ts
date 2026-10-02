import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { provideRefsMocks } from '../../../../../../testing/cadmus-test-helpers';
import { CodNColDefinition } from '../cod-sheet-labels-part';
import { CodNColDefinitionComponent } from './cod-n-col-definition.component';

describe('CodNColDefinitionComponent', () => {
  const DEFINITION: CodNColDefinition = {
    id: 'n.alpha',
    rank: 1,
    isPagination: true,
    system: 'roman',
    technique: 'ink',
    position: 'top',
    colors: ['red'],
    note: 'a note',
  };

  async function setup(
    definition?: CodNColDefinition,
    entries?: { systems?: ThesaurusEntry[]; colors?: ThesaurusEntry[] },
  ) {
    const model = signal<CodNColDefinition | undefined>(definition);
    const editorClose = vi.fn();
    const result = await render(CodNColDefinitionComponent, {
      bindings: [
        twoWayBinding('definition', model),
        inputBinding('sysEntries', () => entries?.systems),
        inputBinding('clrEntries', () => entries?.colors),
        outputBinding('editorClose', editorClose),
      ],
      providers: provideRefsMocks(),
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  // nested editors have their own buttons: ours are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the definition values', async () => {
    await setup(DEFINITION);

    expect(screen.getByRole('spinbutton', { name: /rank/ })).toHaveValue(1);
    expect(screen.getByRole('checkbox', { name: /pagination/ })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /by scribe/ }),
    ).not.toBeChecked();
    expect(textbox(/^system/)).toHaveValue('roman');
    expect(textbox(/^technique/)).toHaveValue('ink');
    expect(textbox(/^position/)).toHaveValue('top');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(saveButton()).toBeDisabled();
  });

  it('should use a select for system when entries are provided', async () => {
    await setup(DEFINITION, { systems: [{ id: 'roman', value: 'Roman' }] });

    const system = screen.getByRole('combobox', { name: /system/ });
    await waitFor(() => expect(system).toHaveTextContent('Roman'));
  });

  it.each([
    [/^system/, 'system required'],
    [/^technique/, 'technique required'],
    [/^position/, 'position required'],
  ])('should require %s', async (name, error) => {
    const { user } = await setup(DEFINITION);

    await user.clear(textbox(name));
    await user.tab();

    expect(screen.getByText(error)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited definition, keeping its ID', async () => {
    const { user, model } = await setup(DEFINITION);

    await user.click(screen.getByRole('checkbox', { name: /pagination/ }));
    await user.click(screen.getByRole('checkbox', { name: /by scribe/ }));
    await user.clear(textbox(/^note/));
    await user.type(textbox(/^note/), ' new ');
    await user.click(saveButton());

    expect(model()).toEqual({
      id: 'n.alpha',
      rank: 1,
      isPagination: undefined,
      isByScribe: true,
      system: 'roman',
      technique: 'ink',
      position: 'top',
      colors: ['red'],
      date: undefined,
      canonicalRanges: undefined,
      links: undefined,
      note: 'new',
    });
  });

  it('should toggle colors', async () => {
    const { user, model } = await setup(DEFINITION, {
      colors: [
        { id: 'red', value: 'red' },
        { id: 'black', value: 'black' },
      ],
    });

    await user.click(screen.getByRole('checkbox', { name: /^red/ }));
    await user.click(screen.getByRole('checkbox', { name: /^black/ }));
    await user.click(saveButton());

    expect(model()!.colors).toEqual(['black']);
  });

  it('should save canonical ranges', async () => {
    const { user, model } = await setup(DEFINITION);

    await user.type(textbox(/^canonical ranges/), '1r-8v');
    // let the location editor emit its debounced change
    await new Promise((r) => setTimeout(r, 350));
    await user.click(saveButton());

    expect(model()!.canonicalRanges).toHaveLength(1);
  });

  it('should show the date editor when date is checked', async () => {
    const { user } = await setup(DEFINITION);
    const before = screen.getAllByRole('textbox').length;

    await user.click(screen.getByRole('checkbox', { name: /^date/ }));

    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(before);
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(DEFINITION);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });

  // signal forms regressions

  it('should ignore child echoes of its data', async () => {
    const { fixture } = await setup(DEFINITION);

    fixture.componentInstance.onLinkIdsChange([]);
    fixture.componentInstance.onColorIdsChange([...(DEFINITION.colors || [])]);
    fixture.detectChanges();

    expect(saveButton()).toBeDisabled();
  });

  it('should get dirty for a real child change', async () => {
    const { fixture } = await setup(DEFINITION);

    fixture.componentInstance.onColorIdsChange(['x']);
    fixture.detectChanges();

    expect(saveButton()).toBeEnabled();
  });

  it('should save on Enter in a text input when dirty', async () => {
    const { user, model } = await setup(DEFINITION);

    await user.type(textbox(/^note/), 'x{Enter}');

    expect((model() as any).note).toBe('a notex');
  });

  it('should not save on Enter while pristine', async () => {
    const { user, model } = await setup(DEFINITION);

    await user.type(textbox(/^note/), '{Enter}');

    expect(model()).toBe(DEFINITION);
  });

  it('should save without the form identity tags', async () => {
    const { user, model } = await setup(DEFINITION);

    await user.type(textbox(/^note/), 'x');
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
    const { container } = await setup(DEFINITION);
    expect(container.querySelector('form')).toBeNull();
  });
});

import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodContentAnnotation } from '../cod-contents-part';
import { CodContentAnnotationComponent } from './cod-content-annotation.component';

describe('CodContentAnnotationComponent', () => {
  const ANNOTATION: CodContentAnnotation = {
    type: 'rubric',
    range: { start: { n: 2 }, end: { n: 3 } },
    features: ['red'],
    languages: ['lat'],
    incipit: 'In principio',
    explicit: 'amen',
    text: 'text',
    note: 'a note',
  };

  async function setup(
    annotation?: CodContentAnnotation,
    entries?: {
      types?: ThesaurusEntry[];
      features?: ThesaurusEntry[];
      languages?: ThesaurusEntry[];
    },
  ) {
    const model = signal<CodContentAnnotation | undefined>(annotation);
    const editorClose = vi.fn();
    const result = await render(CodContentAnnotationComponent, {
      bindings: [
        twoWayBinding('annotation', model),
        inputBinding('typeEntries', () => entries?.types),
        inputBinding('featureEntries', () => entries?.features),
        inputBinding('langEntries', () => entries?.languages),
        outputBinding('editorClose', editorClose),
      ],
    });
    return { ...result, model, editorClose, user: userEvent.setup() };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  const saveButton = () =>
    screen.getByRole('button', { description: /accept changes/i });

  it('should show the annotation values', async () => {
    await setup(ANNOTATION);

    expect(textbox(/^type/)).toHaveValue('rubric');
    expect(textbox(/^range/)).toHaveValue('2-3');
    expect(textbox(/^incipit/)).toHaveValue('In principio');
    expect(textbox(/^explicit/)).toHaveValue('amen');
    expect(textbox(/^text/)).toHaveValue('text');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(saveButton()).toBeDisabled();
  });

  it('should use a select for type when entries are provided', async () => {
    await setup(ANNOTATION, { types: [{ id: 'rubric', value: 'Rubric' }] });

    const type = screen.getByRole('combobox', { name: /type/ });
    await waitFor(() => expect(type).toHaveTextContent('Rubric'));
  });

  it.each([
    [/^type/, 'type required'],
    [/^incipit/, 'incipit required'],
  ])('should require %s', async (name, error) => {
    const { user } = await setup(ANNOTATION);

    await user.clear(textbox(name));
    await user.tab();

    expect(screen.getByText(error)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited annotation', async () => {
    const { user, model } = await setup(ANNOTATION);

    await user.clear(textbox(/^incipit/));
    await user.type(textbox(/^incipit/), ' Incipit ');
    await user.clear(textbox(/^note/));
    await user.click(saveButton());

    expect(model()).toEqual({
      ...ANNOTATION,
      incipit: 'Incipit',
      note: undefined,
    });
  });

  it('should toggle features and languages', async () => {
    const { user, model } = await setup(ANNOTATION, {
      features: [
        { id: 'red', value: 'red ink' },
        { id: 'big', value: 'big' },
      ],
      languages: [
        { id: 'lat', value: 'Latin' },
        { id: 'grc', value: 'Greek' },
      ],
    });

    expect(screen.getByRole('checkbox', { name: /red ink/ })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: /big/ }));
    await user.click(screen.getByRole('checkbox', { name: /Latin/ }));
    await user.click(screen.getByRole('checkbox', { name: /Greek/ }));
    await user.click(saveButton());

    expect(model()!.features).toEqual(['red', 'big']);
    expect(model()!.languages).toEqual(['grc']);
  });

  it('should save an edited range', async () => {
    const { user, model } = await setup(ANNOTATION);

    await user.clear(textbox(/^range/));
    await user.type(textbox(/^range/), '4r-5v');
    await new Promise((r) => setTimeout(r, 350));
    await user.click(saveButton());

    expect(model()!.range.start.n).toBe(4);
    expect(model()!.range.end.n).toBe(5);
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(ANNOTATION);

    await user.click(
      screen.getByRole('button', { description: /discard changes/i }),
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { ThesaurusService } from '@myrmidon/cadmus-api';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { CitSchemeService } from '@myrmidon/cadmus-refs-citation';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { CodContent, CodContentAnnotation } from '../cod-contents-part';
import { CodContentEditorComponent } from './cod-content-editor.component';

describe('CodContentEditorComponent', () => {
  const A1: CodContentAnnotation = {
    type: 'rubric',
    range: { start: { n: 1 }, end: { n: 1 } },
    incipit: 'Incipit liber',
    text: 'first',
  };
  const A2: CodContentAnnotation = {
    type: 'colophon',
    range: { start: { n: 9 }, end: { n: 9 } },
    incipit: 'Explicit',
    text: 'second',
  };
  const CONTENT: CodContent = {
    eid: 'c1',
    ranges: [{ start: { n: 1 }, end: { n: 10 } }],
    states: ['complete'],
    author: 'Dante',
    title: 'Commedia',
    location: 'Inf.1',
    claimedAuthor: 'Durante',
    claimedTitle: 'Comedia',
    tag: 'main',
    note: 'a note',
    incipit: 'Nel mezzo',
    explicit: 'stelle',
    annotations: [A1, A2],
  };

  async function setup(
    content?: CodContent,
    options?: {
      states?: ThesaurusEntry[];
      annTypes?: ThesaurusEntry[];
      confirm?: boolean;
    },
  ) {
    const model = signal<CodContent | undefined>(content);
    const editorClose = vi.fn();
    const dialog = { confirm: vi.fn(() => of(options?.confirm ?? true)) };
    const matDialog = {
      open: vi.fn(() => ({
        afterClosed: () => of({ schemeId: 'dc', steps: [] }),
      })),
    };
    const citSchemeService = {
      toString: vi.fn(() => 'Par.33.145'),
      getSchemes: vi.fn(() => []),
    };
    const result = await render(CodContentEditorComponent, {
      bindings: [
        twoWayBinding('content', model),
        inputBinding('stateEntries', () => options?.states),
        inputBinding('annTypeEntries', () => options?.annTypes),
        outputBinding('editorClose', editorClose),
      ],
      providers: [
        { provide: DialogService, useValue: dialog },
        { provide: CitSchemeService, useValue: citSchemeService },
        // required by the work ID editor
        { provide: 'indexLookupDefinitions', useValue: {} },
        {
          provide: ThesaurusService,
          useValue: { getThesaurus: () => of({ id: 'x', entries: [] }) },
        },
      ],
      configureTestBed: (tb) =>
        tb.overrideProvider(MatDialog, { useValue: matDialog }),
    });
    return {
      ...result,
      model,
      editorClose,
      dialog,
      matDialog,
      user: userEvent.setup(),
    };
  }

  // the content's own field with the specified name, excluding homonymous
  // fields of the nested work ID editor
  const textbox = (name: RegExp) => {
    const workId = screen.getByRole('group', { name: 'work ID' });
    return screen
      .getAllByRole('textbox', { name })
      .find((e) => !workId.contains(e)) as HTMLInputElement;
  };
  // the content editor's own buttons are the last ones
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;
  const openAnnotations = async (user: ReturnType<typeof userEvent.setup>) =>
    user.click(screen.getByRole('button', { name: /^annotations/ }));
  const annotationRows = () =>
    within(screen.getByRole('region', { name: /^annotations/ }))
      .queryAllByRole('row')
      .slice(1);

  it('should show the content values', async () => {
    await setup(CONTENT);

    expect(textbox(/^EID/)).toHaveValue('c1');
    expect(textbox(/^ranges/)).toHaveValue('1-10');
    expect(textbox(/^tag/)).toHaveValue('main');
    expect(textbox(/^author/)).toHaveValue('Dante');
    expect(textbox(/^title/)).toHaveValue('Commedia');
    expect(textbox(/^location/)).toHaveValue('Inf.1');
    expect(textbox(/^claimed author$/)).toHaveValue('Durante');
    expect(textbox(/^claimed title$/)).toHaveValue('Comedia');
    expect(textbox(/^note/)).toHaveValue('a note');
    expect(textbox(/^incipit/)).toHaveValue('Nel mezzo');
    expect(textbox(/^explicit/)).toHaveValue('stelle');
    expect(
      screen.getByRole('button', { name: /^annotations\s*2/ }),
    ).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should require ranges', async () => {
    const { user } = await setup({ ...CONTENT, ranges: [] });

    await user.type(textbox(/^note/), 'x');

    expect(saveButton()).toBeDisabled();
  });

  it('should save the edited content', async () => {
    const { user, model } = await setup(CONTENT);

    await user.clear(textbox(/^title/));
    await user.type(textbox(/^title/), ' Comedy ');
    await user.click(saveButton());

    expect(model()).toEqual(
      expect.objectContaining({
        eid: 'c1',
        title: 'Comedy',
        author: 'Dante',
        states: ['complete'],
        gaps: undefined,
        annotations: [A1, A2],
      }),
    );
  });

  it('should toggle states', async () => {
    const { user, model } = await setup(CONTENT, {
      states: [
        { id: 'complete', value: 'complete' },
        { id: 'mutilated', value: 'mutilated' },
      ],
    });

    expect(screen.getByRole('checkbox', { name: /^complete/ })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: /^mutilated/ }));
    await user.click(saveButton());

    expect(model()!.states).toEqual(['complete', 'mutilated']);
  });

  it('should append a picked citation to the location', async () => {
    const { user, model, matDialog } = await setup(CONTENT);

    await user.click(
      screen.getByRole('button', { description: /pick a citation/i }),
    );

    expect(matDialog.open).toHaveBeenCalled();
    expect(textbox(/^location/)).toHaveValue('Inf.1; Par.33.145');
    await user.click(saveButton());
    expect(model()!.location).toBe('Inf.1; Par.33.145');
  });

  it('should save gaps edited in the gaps editor', async () => {
    const { user, model } = await setup(CONTENT);

    await user.click(screen.getByRole('button', { name: /^gap$/ }));
    for (const [which, citation] of [
      ['start', 'Inf.3.1'],
      ['end', 'Inf.3.9'],
    ]) {
      await user.click(
        screen.getByRole('button', {
          description: new RegExp(`edit ${which} reference`, 'i'),
        }),
      );
      await user.type(
        screen.getByRole('textbox', { name: /^citation/ }),
        citation,
      );
      // the reference editor's accept button comes first
      await user.click(
        screen.getAllByRole('button', { description: /accept changes/i })[0],
      );
    }
    await user.click(screen.getByRole('button', { description: /save gap/i }));
    await user.click(saveButton());

    expect(model()!.gaps).toEqual([
      {
        start: expect.objectContaining({ citation: 'Inf.3.1' }),
        end: expect.objectContaining({ citation: 'Inf.3.9' }),
      },
    ]);
  });

  describe('annotations', () => {
    it('should list annotations', async () => {
      const { user } = await setup(CONTENT);
      await openAnnotations(user);

      expect(annotationRows()).toHaveLength(2);
      expect(within(annotationRows()[0]).getByText('first')).toBeInTheDocument();
    });

    it('should add an annotation', async () => {
      const { user, model } = await setup(CONTENT);
      await openAnnotations(user);

      // the add button precedes the annotation editor panel header
      await user.click(
        screen.getAllByRole('button', { name: /^annotation$/ })[0],
      );
      const editor = screen.getByRole('region', { name: /^annotation$/ });
      await user.type(
        within(editor).getByRole('textbox', { name: /^type/ }),
        'note',
      );
      await user.type(
        within(editor).getByRole('textbox', { name: /^incipit/ }),
        'Hic',
      );
      await user.click(
        within(editor).getByRole('button', { description: /accept changes/i }),
      );

      expect(annotationRows()).toHaveLength(3);
      await user.type(textbox(/^note/), '!');
      await user.click(saveButton());
      expect(model()!.annotations![2]).toEqual(
        expect.objectContaining({ type: 'note', incipit: 'Hic' }),
      );
    });

    it('should not add an annotation when its editing is cancelled', async () => {
      const { user } = await setup(CONTENT);
      await openAnnotations(user);

      await user.click(
        screen.getAllByRole('button', { name: /^annotation$/ })[0],
      );
      expect(annotationRows()).toHaveLength(2);
      await user.click(
        within(screen.getByRole('region', { name: /^annotation$/ })).getByRole(
          'button',
          { description: /discard changes/i },
        ),
      );

      expect(annotationRows()).toHaveLength(2);
    });

    it('should show annotation types from the thesaurus', async () => {
      const { user } = await setup(CONTENT, {
        annTypes: [{ id: 'rubric', value: 'Rubric' }],
      });
      await openAnnotations(user);

      expect(
        within(annotationRows()[0]).getByText('Rubric'),
      ).toBeInTheDocument();
    });

    it('should edit an annotation', async () => {
      const { user, model } = await setup(CONTENT);
      await openAnnotations(user);

      await user.click(
        within(annotationRows()[1]).getByRole('button', {
          description: /edit this annotation/i,
        }),
      );
      const editor = screen.getByRole('region', { name: /^annotation$/ });
      const text = within(editor).getByRole('textbox', { name: /^text/ });
      expect(text).toHaveValue('second');
      await user.type(text, '!');
      await user.click(
        within(editor).getByRole('button', { description: /accept changes/i }),
      );
      await user.type(textbox(/^note/), '!');
      await user.click(saveButton());

      expect(model()!.annotations![1].text).toBe('second!');
    });

    it('should delete an annotation after confirmation', async () => {
      const { user, dialog } = await setup(CONTENT);
      await openAnnotations(user);

      await user.click(
        within(annotationRows()[0]).getByRole('button', {
          description: /delete this annotation/i,
        }),
      );

      expect(dialog.confirm).toHaveBeenCalled();
      expect(annotationRows()).toHaveLength(1);
    });

    it('should not delete an annotation when not confirmed', async () => {
      const { user } = await setup(CONTENT, { confirm: false });
      await openAnnotations(user);

      await user.click(
        within(annotationRows()[0]).getByRole('button', {
          description: /delete this annotation/i,
        }),
      );

      expect(annotationRows()).toHaveLength(2);
    });

    it('should move annotations', async () => {
      const { user, model } = await setup(CONTENT);
      await openAnnotations(user);

      await user.click(
        within(annotationRows()[0]).getByRole('button', {
          description: /move this annotation down/i,
        }),
      );
      await user.click(saveButton());
      expect(model()!.annotations).toEqual([A2, A1]);

      await user.click(
        within(annotationRows()[1]).getByRole('button', {
          description: /move this annotation up/i,
        }),
      );
      await user.click(saveButton());
      expect(model()!.annotations).toEqual([A1, A2]);
    });
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(CONTENT);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });
});

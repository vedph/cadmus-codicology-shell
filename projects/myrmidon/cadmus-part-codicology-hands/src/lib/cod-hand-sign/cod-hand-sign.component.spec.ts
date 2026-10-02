import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { delay, of } from 'rxjs';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  MufiChar,
  MufiRefLookupService,
  MufiService,
} from '@myrmidon/cadmus-refs-mufi-lookup';

import { CodHandSign } from '../cod-hands-part';
import { CodHandSignComponent } from './cod-hand-sign.component';

describe('CodHandSignComponent', () => {
  const CHAR: MufiChar = {
    code: 0xe8b7,
    uppercaseCode: 0,
    unicodeCategory: 'Ll',
    url: 'http://mufi',
    unicodeName: 'LATIN SMALL LETTER Q WITH STROKE',
    mufiName: 'q with stroke',
    comment: 'a comment',
    svg: '<svg><text>q</text></svg>',
  };
  const SIGN: CodHandSign = {
    eid: 's1',
    type: 'abbr',
    sampleLocation: { n: 3 },
    description: 'a sign',
  };

  async function setup(sign?: CodHandSign, typeEntries?: ThesaurusEntry[]) {
    const model = signal<CodHandSign | undefined>(sign);
    const editorClose = vi.fn();
    // emulate an HTTP call, which is asynchronous
    const mufiService = { get: vi.fn(() => of(CHAR).pipe(delay(0))) };
    const lookupService = {
      id: 'mufi',
      lookup: vi.fn(() => of([CHAR])),
      getName: (c: MufiChar) => c?.mufiName,
      getById: vi.fn(() => of(CHAR)),
    };
    const result = await render(CodHandSignComponent, {
      bindings: [
        twoWayBinding('sign', model),
        inputBinding('typeEntries', () => typeEntries),
        outputBinding('editorClose', editorClose),
      ],
      providers: [
        { provide: MufiService, useValue: mufiService },
        { provide: MufiRefLookupService, useValue: lookupService },
      ],
    });
    return {
      ...result,
      model,
      editorClose,
      mufiService,
      user: userEvent.setup(),
    };
  }

  const textbox = (name: RegExp) =>
    screen.getByRole('textbox', { name }) as HTMLInputElement;
  const saveButton = () =>
    screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!;

  it('should show the sign values', async () => {
    await setup(SIGN);

    expect(textbox(/^type/)).toHaveValue('abbr');
    expect(textbox(/^EID/)).toHaveValue('s1');
    expect(textbox(/^sample/)).toHaveValue('3');
    expect(textbox(/^description/)).toHaveValue('a sign');
    expect(saveButton()).toBeDisabled();
  });

  it('should not be dirty after loading a sign with a MUFI character', async () => {
    await setup({ ...SIGN, mufi: CHAR.code });

    await screen.findByText('a comment');
    expect(saveButton()).toBeDisabled();
  });

  it('should stay pristine once the location editor has initialized', async () => {
    await setup(SIGN);

    // the location editor emits its initial value after a debounce
    await new Promise((r) => setTimeout(r, 400));

    expect(saveButton()).toBeDisabled();
  });

  it('should use a select for type when entries are provided', async () => {
    await setup(SIGN, [{ id: 'abbr', value: 'abbreviation' }]);

    const type = screen.getByRole('combobox', { name: /type/ });
    await waitFor(() => expect(type).toHaveTextContent('abbreviation'));
  });

  it('should require the type', async () => {
    const { user } = await setup(SIGN);

    await user.clear(textbox(/^type/));
    await user.tab();

    expect(screen.getByText('type required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should load and show the MUFI character of the sign', async () => {
    const { mufiService } = await setup({ ...SIGN, mufi: CHAR.code });

    expect(mufiService.get).toHaveBeenCalledWith(CHAR.code);
    expect(await screen.findByText('a comment')).toBeInTheDocument();
  });

  it('should not load a MUFI character when not set', async () => {
    const { mufiService } = await setup(SIGN);

    expect(mufiService.get).not.toHaveBeenCalled();
    expect(screen.queryByText('a comment')).toBeNull();
  });

  it('should save the edited sign, keeping the MUFI code', async () => {
    const { user, model } = await setup({ ...SIGN, mufi: CHAR.code });

    await user.clear(textbox(/^description/));
    await user.type(textbox(/^description/), ' changed ');
    await user.click(saveButton());

    expect(model()).toEqual({
      eid: 's1',
      mufi: CHAR.code,
      type: 'abbr',
      sampleLocation: { n: 3 },
      description: 'changed',
    });
  });

  it('should save an edited sample location', async () => {
    const { user, model } = await setup(SIGN);

    await user.clear(textbox(/^sample/));
    await user.type(textbox(/^sample/), '5v');
    await new Promise((r) => setTimeout(r, 350));
    await user.click(saveButton());

    expect(model()!.sampleLocation.n).toBe(5);
  });

  it('should emit editorClose on cancel', async () => {
    const { user, editorClose } = await setup(SIGN);

    await user.click(
      screen.getAllByRole('button', { description: /discard changes/i }).at(-1)!,
    );

    expect(editorClose).toHaveBeenCalled();
  });

  // signal forms regressions

  it('should ignore child echoes of its data', async () => {
    const { fixture } = await setup(SIGN);

    fixture.componentInstance.onMufiItemChange(null);
    fixture.componentInstance.onLocationChange([{ start: { n: 3 }, end: { n: 3 } }]);
    fixture.detectChanges();

    expect(saveButton()).toBeDisabled();
  });

  it('should get dirty for a real child change', async () => {
    const { fixture } = await setup(SIGN);

    fixture.componentInstance.onLocationChange([{ start: { n: 4 }, end: { n: 4 } }]);
    fixture.detectChanges();

    expect(saveButton()).toBeEnabled();
  });

  it('should save on Enter in a text input when dirty', async () => {
    const { user, model } = await setup(SIGN);

    await user.type(textbox(/^EID/), 'x{Enter}');

    expect((model() as any).eid).toBe('s1x');
  });

  it('should not save on Enter while pristine', async () => {
    const { user, model } = await setup(SIGN);

    await user.type(textbox(/^EID/), '{Enter}');

    expect(model()).toBe(SIGN);
  });

  it('should save without the form identity tags', async () => {
    const { user, model } = await setup(SIGN);

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
    const { container } = await setup(SIGN);
    expect(container.querySelector('form')).toBeNull();
  });

  it('should look up the bound MUFI character without getting dirty', async () => {
    const { fixture } = await setup({ ...SIGN, mufi: CHAR.code });

    await waitFor(() =>
      expect(fixture.componentInstance.form.mufi().value()?.code).toBe(
        CHAR.code,
      ),
    );
    expect(saveButton()).toBeDisabled();
  });

  it('should ignore a stale MUFI lookup after a new sign is bound', async () => {
    const { fixture, model } = await setup({ ...SIGN, mufi: CHAR.code });

    model.set({ ...SIGN, eid: 's2' });
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 10));

    expect(fixture.componentInstance.form.mufi().value()).toBeNull();
  });
});

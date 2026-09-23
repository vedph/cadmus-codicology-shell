import {
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
} from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { EditedObject } from '@myrmidon/cadmus-core';

import {
  buildEditedPart,
  buildPart,
  createEditorMocks,
  provideEditorMocks,
} from '../../../../../../testing/cadmus-test-helpers';
import {
  COD_LOCATION_RANGES_PART_TYPEID,
  CodLocationRangesPart,
} from '../cod-location-ranges-part';
import { CodLocationRangesPartComponent } from './cod-location-ranges-part';

describe('CodLocationRangesPartComponent', () => {
  const IDENTITY = {
    itemId: 'item1',
    typeId: COD_LOCATION_RANGES_PART_TYPEID,
    partId: 'p1',
    roleId: null,
  };

  async function setup(options?: {
    part?: Partial<CodLocationRangesPart>;
    roles?: string[];
  }) {
    const mocks = createEditorMocks(options);
    const data = signal<EditedObject<CodLocationRangesPart> | undefined>(
      buildEditedPart(
        options?.part
          ? buildPart<CodLocationRangesPart>(COD_LOCATION_RANGES_PART_TYPEID, {
              ranges: [],
              ...options.part,
            })
          : undefined,
      ),
    );
    const editorClose = vi.fn();
    const result = await render(CodLocationRangesPartComponent, {
      bindings: [
        inputBinding('identity', () => IDENTITY),
        twoWayBinding('data', data),
        outputBinding('editorClose', editorClose),
      ],
      providers: provideEditorMocks(mocks),
    });
    return { ...result, data, mocks, editorClose, user: userEvent.setup() };
  }

  const locationInput = () =>
    screen.getByRole('textbox', { name: /^location/ }) as HTMLInputElement;
  const noteInput = () => screen.getByRole('textbox', { name: /^note/ });
  const saveButton = () => screen.getByRole('button', { name: /save/ });

  it('should show the default title', async () => {
    await setup();
    expect(
      screen.getByText('Codicological Location Ranges Part'),
    ).toBeInTheDocument();
  });

  it('should show the part ranges and note', async () => {
    await setup({
      part: {
        ranges: [{ start: { n: 1 }, end: { n: 3 } }],
        note: 'a note',
      },
    });

    expect(locationInput()).toHaveValue('1-3');
    expect(noteInput()).toHaveValue('a note');
  });

  it('should save edited ranges and note', async () => {
    const { user, data } = await setup({
      part: { ranges: [{ start: { n: 1 }, end: { n: 3 } }] },
    });

    await user.clear(locationInput());
    await user.type(locationInput(), '2r-5v');
    // let the location editor emit its debounced change
    await new Promise((r) => setTimeout(r, 350));
    await user.type(noteInput(), ' note ');
    await user.click(saveButton());

    const part = data()!.value!;
    expect(part.typeId).toBe(COD_LOCATION_RANGES_PART_TYPEID);
    expect(part.ranges).toHaveLength(1);
    expect(part.ranges[0].start.n).toBe(2);
    expect(part.ranges[0].end.n).toBe(5);
    expect(part.note).toBe('note');
  });

  it('should save an empty note as undefined', async () => {
    const { user, data } = await setup({
      part: { ranges: [{ start: { n: 1 }, end: { n: 1 } }], note: 'x' },
    });

    await user.clear(noteInput());
    await user.click(saveButton());

    expect(data()!.value!.note).toBeUndefined();
  });

  it('should create a new part when editing without data', async () => {
    const { user, data } = await setup();

    await user.type(locationInput(), '1r');
    await new Promise((r) => setTimeout(r, 350));
    await user.click(saveButton());

    expect(data()!.value).toEqual(
      expect.objectContaining({
        itemId: 'item1',
        typeId: COD_LOCATION_RANGES_PART_TYPEID,
        ranges: [expect.anything()],
      }),
    );
  });

  it('should hide save for users below operator level', async () => {
    await setup({ part: {}, roles: ['visitor'] });
    expect(screen.queryByRole('button', { name: /save/ })).toBeNull();
  });

  it('should emit editorClose when closing', async () => {
    const { user, editorClose } = await setup({ part: {} });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalled();
  });
});

import { inputBinding, signal, twoWayBinding } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodImage, CodImagesComponent } from './cod-images.component';

describe('CodImagesComponent', () => {
  const IMAGES: CodImage[] = [
    { id: 'img1', type: 'photo', sourceId: 's1', label: 'first' },
    { id: 'img2', type: 'scan', copyright: '(c) X' },
  ];

  async function setup(images?: CodImage[], typeEntries?: ThesaurusEntry[]) {
    const model = signal<CodImage[] | undefined>(images);
    const result = await render(CodImagesComponent, {
      bindings: [
        twoWayBinding('images', model),
        inputBinding('typeEntries', () => typeEntries),
      ],
    });
    return { ...result, model, user: userEvent.setup() };
  }

  const idInputs = () =>
    screen.queryAllByRole('textbox', { name: /^ID/ }) as HTMLInputElement[];

  it('should render one editor per image', async () => {
    await setup(IMAGES);

    expect(idInputs().map((i) => i.value)).toEqual(['img1', 'img2']);
    const types = screen.getAllByRole('textbox', {
      name: /^type/,
    }) as HTMLInputElement[];
    expect(types.map((t) => t.value)).toEqual(['photo', 'scan']);
    expect(screen.getAllByRole('textbox', { name: /label/ })[0]).toHaveValue(
      'first',
    );
    expect(screen.getAllByRole('textbox', { name: /copyright/ })[1]).toHaveValue(
      '(c) X',
    );
  });

  it('should render no editors without images', async () => {
    await setup();
    expect(idInputs()).toHaveLength(0);
  });

  it('should use a select for type when type entries are provided', async () => {
    await setup(IMAGES, [
      { id: 'photo', value: 'Photo' },
      { id: 'scan', value: 'Scan' },
    ]);

    expect(screen.queryAllByRole('textbox', { name: /^type/ })).toHaveLength(0);
    const combos = screen.getAllByRole('combobox', { name: /type/ });
    expect(combos).toHaveLength(2);
    await waitFor(() => expect(combos[0]).toHaveTextContent('Photo'));
    expect(combos[1]).toHaveTextContent('Scan');
  });

  it('should add a new empty image', async () => {
    const { user } = await setup(IMAGES);

    await user.click(screen.getByRole('button', { name: /image/ }));

    expect(idInputs()).toHaveLength(3);
    expect(idInputs()[2]).toHaveValue('');
  });

  it('should update images after editing a field', async () => {
    const { user, model } = await setup(IMAGES);

    await user.clear(idInputs()[0]);
    await user.type(idInputs()[0], ' new-id ');

    await waitFor(() => expect(model()![0].id).toBe('new-id'));
    expect(model()![1].id).toBe('img2');
  });

  it('should include added images in the model once edited', async () => {
    const { user, model } = await setup();

    await user.click(screen.getByRole('button', { name: /image/ }));
    await user.type(idInputs()[0], 'x');
    await user.type(screen.getByRole('textbox', { name: /^type/ }), 'photo');

    await waitFor(() =>
      expect(model()).toEqual([
        expect.objectContaining({ id: 'x', type: 'photo' }),
      ]),
    );
  });

  it('should remove an image', async () => {
    const { user, model } = await setup(IMAGES);

    await user.click(
      screen.getAllByRole('button', { description: /remove this image/i })[0],
    );

    expect(idInputs().map((i) => i.value)).toEqual(['img2']);
    expect(model()!.map((i) => i.id)).toEqual(['img2']);
  });

  it('should set images to undefined when removing the last one', async () => {
    const { user, model } = await setup([IMAGES[0]]);

    await user.click(
      screen.getByRole('button', { description: /remove this image/i }),
    );

    expect(model()).toBeUndefined();
  });

  it('should move images up and down', async () => {
    const { user, model } = await setup(IMAGES);
    const up = () =>
      screen.getAllByRole('button', { description: /move image up/i });
    const down = () =>
      screen.getAllByRole('button', { description: /move image down/i });

    expect(up()[0]).toBeDisabled();
    expect(down()[1]).toBeDisabled();

    await user.click(down()[0]);
    expect(model()!.map((i) => i.id)).toEqual(['img2', 'img1']);
    expect(idInputs().map((i) => i.value)).toEqual(['img2', 'img1']);

    await user.click(up()[1]);
    expect(model()!.map((i) => i.id)).toEqual(['img1', 'img2']);
  });

  it('should show a required error for an empty ID', async () => {
    const { user } = await setup(IMAGES);

    await user.clear(idInputs()[0]);
    await user.tab();

    expect(screen.getByText('ID required')).toBeInTheDocument();
  });
});

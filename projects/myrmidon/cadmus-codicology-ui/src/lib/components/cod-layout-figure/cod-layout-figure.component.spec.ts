import { inputBinding, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import {
  CodLayoutFigureComponent,
  CodLayoutRectSet,
} from './cod-layout-figure.component';

// The figure is a purely graphical SVG without accessible roles, so these
// tests inspect the rendered SVG output (the only user-visible result).
describe('CodLayoutFigureComponent', () => {
  const RECTS: CodLayoutRectSet = {
    height: [
      { name: 'margin-top', value: 30 },
      { name: 'area', value: 130 },
      { name: 'margin-bottom', value: 40, empty: true },
    ],
    width: [
      { name: 'margin-left', value: 15 },
      { name: 'column', value: 130 },
      { name: 'margin-right', value: 15 },
    ],
    gap: 0,
  };

  async function setup(rects?: CodLayoutRectSet, noScale = false) {
    const rectsSig = signal<CodLayoutRectSet | undefined>(rects);
    const result = await render(CodLayoutFigureComponent, {
      bindings: [
        inputBinding('rects', rectsSig),
        inputBinding('noScale', () => noScale),
      ],
    });
    const svg = result.container.querySelector('svg')!;
    return { ...result, svg, rectsSig, user: userEvent.setup() };
  }

  const titles = (svg: SVGElement) =>
    Array.from(svg.querySelectorAll('rect')).map((r) =>
      r.getAttribute('title'),
    );

  it('should render nothing but the default viewbox without rects', async () => {
    const { svg } = await setup();

    expect(svg.getAttribute('viewBox')).toBe('0 0 200 400');
    expect(svg.querySelectorAll('rect')).toHaveLength(0);
  });

  it('should render both height and width rects', async () => {
    const { svg } = await setup(RECTS);

    expect(titles(svg)).toEqual([
      'margin-top',
      'area',
      'margin-bottom',
      'margin-left',
      'column',
      'margin-right',
    ]);
  });

  it('should scale to the default size', async () => {
    const { svg } = await setup(RECTS);
    expect(svg.getAttribute('viewBox')).toBe('0 0 200 400');
  });

  it('should use the natural size when noScale is set', async () => {
    const { svg } = await setup(RECTS, true);
    expect(svg.getAttribute('viewBox')).toBe('0 0 160 200');
  });

  it('should lay out height rects vertically and width rects horizontally', async () => {
    const { svg } = await setup(RECTS);
    const rects = Array.from(svg.querySelectorAll('rect'));

    // height rects: stacked at x=left margin width
    expect(rects[0].getAttribute('y')).toBe('0');
    expect(rects[1].getAttribute('y')).toBe('30');
    expect(rects[2].getAttribute('y')).toBe('160');
    expect(rects[1].getAttribute('x')).toBe('15');
    // width rects: side by side, starting below top margin
    expect(rects[3].getAttribute('x')).toBe('0');
    expect(rects[4].getAttribute('x')).toBe('15');
    expect(rects[5].getAttribute('x')).toBe('145');
    expect(rects[4].getAttribute('y')).toBe('30');
  });

  it('should fill empty rects with white', async () => {
    const { svg } = await setup(RECTS);
    const rects = Array.from(svg.querySelectorAll('rect'));

    expect(rects[2].getAttribute('fill')).toBe('white');
    expect(rects[1].getAttribute('fill')).toBe('#c0c0c0');
  });

  it('should cycle visibility modes on click', async () => {
    const { svg, user, fixture } = await setup(RECTS);

    // both -> height only
    await user.click(svg);
    fixture.detectChanges();
    expect(titles(svg)).toEqual(['margin-top', 'area', 'margin-bottom']);

    // height -> width only
    await user.click(svg);
    fixture.detectChanges();
    expect(titles(svg)).toEqual(['margin-left', 'column', 'margin-right']);

    // width -> both
    await user.click(svg);
    fixture.detectChanges();
    expect(titles(svg)).toHaveLength(6);
  });

  it('should refresh when rects change', async () => {
    const { svg, rectsSig, fixture } = await setup(RECTS);

    rectsSig.set(undefined);
    fixture.detectChanges();

    expect(svg.querySelectorAll('rect')).toHaveLength(0);
  });
});

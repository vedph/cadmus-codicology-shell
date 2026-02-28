import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  signal,
  ViewChild,
} from '@angular/core';

import { CodLayoutRect } from '../../services/cod-layout.service';

export interface CodLayoutRectSet {
  height: CodLayoutRect[];
  width: CodLayoutRect[];
  gap: number;
}

interface CodLayoutFigureRect {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

/**
 * A figure displaying a set of MS layout rectangles.
 */
@Component({
  selector: 'cadmus-cod-layout-figure',
  templateUrl: './cod-layout-figure.component.html',
  styleUrls: ['./cod-layout-figure.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodLayoutFigureComponent {
  @ViewChild('fig') fig: ElementRef | undefined;

  /**
   * If true, the figure will not be scaled to fit the size.
   */
  public readonly noScale = input<boolean>();

  /**
   * The desired size of the figure.
   */
  public readonly size = model<{ height: number; width: number }>({
    width: 200,
    height: 400,
  });

  /**
   * The set of MS layout rectangles to be displayed.
   */
  public readonly rects = model<CodLayoutRectSet>();

  // visibility mode: 0=none, 1=height, 2=width, 3=both
  public readonly visMode = signal<number>(3);

  private readonly _resolvedSize = computed(() => {
    const s = this.size();
    return s ? { height: s.height, width: s.width } : { height: 400, width: 200 };
  });

  public readonly heightRects = signal<CodLayoutFigureRect[]>([]);
  public readonly widthRects = signal<CodLayoutFigureRect[]>([]);
  public readonly viewbox = signal<string>('0 0 200 400');

  constructor() {
    // after the view is first rendered, compute the figure
    afterNextRender(() => {
      this.refresh(this.rects());
    });

    // whenever rects or size change (after first render), recompute
    effect(() => {
      const rects = this.rects();
      const size = this._resolvedSize();
      // afterNextRender handles the initial render; subsequent updates
      // are driven by this effect (signals track rects and size)
      this.refresh(rects, size);
    });
  }

  private refresh(
    rects?: CodLayoutRectSet,
    size?: { height: number; width: number },
  ): void {
    const resolvedSize = size ?? this._resolvedSize();

    if (!rects) {
      this.widthRects.set([]);
      this.heightRects.set([]);
      this.viewbox.set('0 0 200 400');
      return;
    }

    // viewport
    const h =
      rects.height.reduce((a, b) => {
        return a + b.value;
      }, 0) +
      // gaps
      rects.gap * rects.height.length;

    const w =
      rects.width.reduce((a, b) => {
        return a + b.value;
      }, 0) +
      // gaps
      rects.gap * rects.width.length;

    // height
    const hr: CodLayoutFigureRect[] = [];
    // the horz boxes have margin at left and right
    const hlm = rects.width[0].value + rects.gap;
    const hrm = rects.gap + rects.width[rects.width.length - 1].value;
    const hw = w - hlm - hrm - rects.gap;

    let y = 0;
    for (let i = 0; i < rects.height.length; i++) {
      const r = rects.height[i];
      hr.push({
        name: r.name,
        x: hlm,
        y: y,
        width: hw,
        height: r.value,
        fill: r.empty ? 'white' : '#c0c0c0',
      });
      y += r.value + rects.gap;
    }

    // width
    const wr: CodLayoutFigureRect[] = [];
    // the vert boxes have margin at top and bottom
    const wtm = rects.height[0].value + rects.gap;
    const wbm = rects.height[rects.height.length - 1].value + rects.gap;
    const wh = h - wtm - wbm - rects.gap;
    let x = 0;

    for (let i = 0; i < rects.width.length; i++) {
      const r = rects.width[i];
      wr.push({
        name: r.name,
        x: x,
        y: wtm,
        width: r.value,
        height: wh,
        fill: r.empty ? 'white' : '#c0c0c0',
      });
      x += r.value + rects.gap;
    }

    this.heightRects.set(hr);
    this.widthRects.set(wr);

    // scale
    if (this.noScale()) {
      this.viewbox.set(`0 0 ${w} ${h}`);
    } else {
      this.viewbox.set(`0 0 ${resolvedSize.width} ${resolvedSize.height}`);
    }
  }

  public onSvgClick(): void {
    this.visMode.update((v) => (v === 3 ? 1 : v + 1));
  }
}

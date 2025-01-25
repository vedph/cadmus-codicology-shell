import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  model,
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
})
export class CodLayoutFigureComponent implements AfterViewInit {
  private _afterInit = false;
  // visibility mode: 0=none, 1=height, 2=width, 3=both
  public visMode = 3;

  public height: number;
  public width: number;
  public heightRects: CodLayoutFigureRect[];
  public widthRects: CodLayoutFigureRect[];

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

  public viewbox: string;

  constructor() {
    this.viewbox = '0 0 200 400';
    this.width = 200;
    this.height = 400;
    this.heightRects = [];
    this.widthRects = [];

    effect(() => {
      const size = this.size();
      if (size) {
        this.height = size.height;
        this.width = size.width;
      } else {
        this.height = 400;
        this.width = 200;
      }
      if (this._afterInit) {
        this.refresh(this.rects());
      }
    });
  }

  private refresh(rects?: CodLayoutRectSet): void {
    if (!rects) {
      this.widthRects = [];
      this.heightRects = [];
      this.viewbox = '0 0 200 400';
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

    this.heightRects = hr;
    this.widthRects = wr;

    // scale
    if (this.noScale()) {
      this.viewbox = `0 0 ${w} ${h}`;
    } else {
      this.viewbox = `0 0 ${this.width} ${this.height}`;
    }
  }

  public ngAfterViewInit(): void {
    this._afterInit = true;
    setTimeout(() => {
      this.refresh(this.rects());
    }, 500);
  }

  public onSvgClick(): void {
    this.visMode = this.visMode === 3 ? 1 : this.visMode + 1;
  }
}

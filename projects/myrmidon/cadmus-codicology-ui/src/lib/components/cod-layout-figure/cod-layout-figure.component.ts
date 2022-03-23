import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
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

@Component({
  selector: 'cadmus-cod-layout-figure',
  templateUrl: './cod-layout-figure.component.html',
  styleUrls: ['./cod-layout-figure.component.css'],
})
export class CodLayoutFigureComponent implements OnInit, AfterViewInit {
  private _rectSet: CodLayoutRectSet | undefined;
  private _afterInit = false;
  // visibility mode: 0=none, 1=height, 2=width, 3=both
  public visMode = 3;

  public height: number;
  public width: number;
  public heightRects: CodLayoutFigureRect[];
  public widthRects: CodLayoutFigureRect[];

  @ViewChild('fig') fig: ElementRef | undefined;

  @Input()
  public noScale?: boolean;

  /**
   * The desired size of the figure.
   */
  @Input()
  public get size(): { height: number; width: number } {
    return { height: this.height, width: this.width };
  }
  public set size(value: { height: number; width: number }) {
    if (value) {
      this.height = value.height;
      this.width = value.width;
    }
  }

  /**
   * The set of MS layout rectangles to be displayed.
   */
  @Input()
  public get rects(): CodLayoutRectSet | undefined {
    return this._rectSet;
  }
  public set rects(value: CodLayoutRectSet | undefined) {
    this._rectSet = value;
    if (this._afterInit) {
      this.refresh();
    }
  }

  public viewbox: string;

  constructor() {
    this.viewbox = '0 0 200 400';
    this.width = 200;
    this.height = 400;
    this.heightRects = [];
    this.widthRects = [];
  }

  private refresh(): void {
    if (!this._rectSet) {
      this.widthRects = [];
      this.heightRects = [];
      this.viewbox = '0 0 200 400';
      return;
    }

    // viewport
    const h =
      this._rectSet.height.reduce((a, b) => {
        return a + b.value;
      }, 0) +
      // gaps
      this._rectSet.gap * this._rectSet.height.length;

    const w =
      this._rectSet.width.reduce((a, b) => {
        return a + b.value;
      }, 0) +
      // gaps
      this._rectSet.gap * this._rectSet.width.length;

    // height
    const hr: CodLayoutFigureRect[] = [];
    // the horz boxes have margin at left and right
    const hlm = this._rectSet.width[0].value + this._rectSet.gap;
    const hrm =
      this._rectSet.gap +
      this._rectSet.width[this._rectSet.width.length - 1].value;
    const hw = w - hlm - hrm - this._rectSet.gap;

    let y = 0;
    for (let i = 0; i < this._rectSet.height.length; i++) {
      const r = this._rectSet.height[i];
      hr.push({
        name: r.name,
        x: hlm,
        y: y,
        width: hw,
        height: r.value,
        fill: r.empty ? 'white' : '#c0c0c0',
      });
      y += r.value + this._rectSet.gap;
    }

    // width
    const wr: CodLayoutFigureRect[] = [];
    // the vert boxes have margin at top and bottom
    const wtm = this._rectSet.height[0].value + this._rectSet.gap;
    const wbm =
      this._rectSet.height[this._rectSet.height.length - 1].value +
      this._rectSet.gap;
    const wh = h - wtm - wbm - this._rectSet.gap;
    let x = 0;

    for (let i = 0; i < this._rectSet.width.length; i++) {
      const r = this._rectSet.width[i];
      wr.push({
        name: r.name,
        x: x,
        y: wtm,
        width: r.value,
        height: wh,
        fill: r.empty ? 'white' : '#c0c0c0',
      });
      x += r.value + this._rectSet.gap;
    }

    this.heightRects = hr;
    this.widthRects = wr;

    // scale
    if (this.noScale) {
      this.viewbox = `0 0 ${w} ${h}`;
      // this.width = w;
      // this.height = h;
      // if (this.fig?.nativeElement) {
      //   this.fig.nativeElement.style.width = w;
      //   this.fig.nativeElement.style.height = h;
      // }
    } else {
      this.viewbox = `0 0 ${this.width} ${this.height}`;
    }
  }

  public ngOnInit(): void {}

  public ngAfterViewInit(): void {
    this._afterInit = true;
    setTimeout(() => {
      this.refresh();
    }, 500);
  }

  public onSvgClick(): void {
    this.visMode = this.visMode === 3 ? 1 : this.visMode + 1;
  }
}

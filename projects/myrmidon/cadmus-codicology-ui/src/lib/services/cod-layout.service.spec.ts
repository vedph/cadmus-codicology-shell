import { TestBed } from '@angular/core/testing';

import { CodLayoutService } from './cod-layout.service';

describe('CodLayoutService', () => {
  let service: CodLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse empty as null', () => {
    const r = service.parseFormula('');
    expect(r.error).toBeFalsy();
    expect(r.value).toBeNull();
  });

  it('should parse single column clw-cw-crw', () => {
    const r = service.parseFormula(
      //                                 ml clw  cw  crw mr
      '250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15'
    );
    expect(r.error).toBeFalsy();
    expect(r.value).toBeTruthy();

    const map: Map<string, number> = r.value!;
    // height, width
    expect(map.get('height')).toBe(250);
    expect(map.get('width')).toBe(160);
    // height details
    expect(map.get('margin-top')).toBe(30);
    expect(map.get('head-e')).toBe(5);
    expect(map.get('area-height')).toBe(170);
    expect(map.get('foot-w')).toBe(5);
    expect(map.get('margin-bottom')).toBe(40);
    // width details
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-1-left-w')).toBe(3);
    expect(map.get('col-1-width')).toBe(50);
    expect(map.get('col-1-right-w')).toBe(5);
    expect(map.get('margin-right')).toBe(15);
  });

  it('should parse single column cle-cw-crw', () => {
    const r = service.parseFormula(
      //                                 ml  cle cw  crw   mr
      '250 × 160 = 30 / 5 [170 / 5] 40 × 15 / 3 [50 / 5] / 15'
    );
    expect(r.error).toBeFalsy();
    expect(r.value).toBeTruthy();

    const map: Map<string, number> = r.value!;
    // height, width
    expect(map.get('height')).toBe(250);
    expect(map.get('width')).toBe(160);
    // height details
    expect(map.get('margin-top')).toBe(30);
    expect(map.get('head-e')).toBe(5);
    expect(map.get('area-height')).toBe(170);
    expect(map.get('foot-w')).toBe(5);
    expect(map.get('margin-bottom')).toBe(40);
    // width details
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-1-left-e')).toBe(3);
    expect(map.get('col-1-width')).toBe(50);
    expect(map.get('col-1-right-w')).toBe(5);
    expect(map.get('margin-right')).toBe(15);
  });

  it('should parse single column clw-cw-cre', () => {
    const r = service.parseFormula(
      //                                 ml   clw  cw cre  mr
      '250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50] 5 / 15'
    );
    expect(r.error).toBeFalsy();
    expect(r.value).toBeTruthy();

    const map: Map<string, number> = r.value!;
    // height, width
    expect(map.get('height')).toBe(250);
    expect(map.get('width')).toBe(160);
    // height details
    expect(map.get('margin-top')).toBe(30);
    expect(map.get('head-e')).toBe(5);
    expect(map.get('area-height')).toBe(170);
    expect(map.get('foot-w')).toBe(5);
    expect(map.get('margin-bottom')).toBe(40);
    // width details
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-1-left-w')).toBe(3);
    expect(map.get('col-1-width')).toBe(50);
    expect(map.get('col-1-right-e')).toBe(5);
    expect(map.get('margin-right')).toBe(15);
  });

  it('should parse single column cle-cw-cre', () => {
    const r = service.parseFormula(
      //                                 ml   cle  cw cre  mr
      '250 × 160 = 30 / 5 [170 / 5] 40 × 15 / 3   [50] 5 / 15'
    );
    expect(r.error).toBeFalsy();
    expect(r.value).toBeTruthy();

    const map: Map<string, number> = r.value!;
    // height, width
    expect(map.get('height')).toBe(250);
    expect(map.get('width')).toBe(160);
    // height details
    expect(map.get('margin-top')).toBe(30);
    expect(map.get('head-e')).toBe(5);
    expect(map.get('area-height')).toBe(170);
    expect(map.get('foot-w')).toBe(5);
    expect(map.get('margin-bottom')).toBe(40);
    // width details
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-1-left-e')).toBe(3);
    expect(map.get('col-1-width')).toBe(50);
    expect(map.get('col-1-right-e')).toBe(5);
    expect(map.get('margin-right')).toBe(15);
  });

  const text1 =
    // H   W   | mt   he ah   fw  mb | ml   clw  cw   cre cg clw  cw cre  mr
    '250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15';
  it('should parse ' + text1, () => {
    const r = service.parseFormula(text1);
    expect(r.error).toBeFalsy();
    expect(r.value).toBeTruthy();

    const map: Map<string, number> = r.value!;
    // height, width
    expect(map.get('height')).toBe(250);
    expect(map.get('width')).toBe(160);
    // height details
    expect(map.get('margin-top')).toBe(30);
    expect(map.get('head-e')).toBe(5);
    expect(map.get('area-height')).toBe(170);
    expect(map.get('foot-w')).toBe(5);
    expect(map.get('margin-bottom')).toBe(40);
    // width details
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-1-left-w')).toBe(5);
    expect(map.get('col-1-width')).toBe(50);
    expect(map.get('col-1-right-e')).toBe(5);
    expect(map.get('col-1-gap')).toBe(20);
    expect(map.get('col-2-left-w')).toBe(5);
    expect(map.get('col-2-width')).toBe(40);
    expect(map.get('col-2-right-e')).toBe(5);
    expect(map.get('margin-right')).toBe(15);
  });

  //             H     W     mt  ah   mb   ml clw  cw  crw cg clw  cw crw  mr
  const text2 = '200 x 160 = 30 [130] 40 x 15 [5 / 50 / 5 (10) 5 / 50 / 5] 15';
  it('should parse ' + text2, () => {
    const r = service.parseFormula(text2);
    expect(r.error).toBeFalsy();
    expect(r.value).toBeTruthy();

    const map: Map<string, number> = r.value!;
    // height, width
    expect(map.get('height')).toBe(200);
    expect(map.get('width')).toBe(160);
    // height details
    expect(map.get('margin-top')).toBe(30);
    expect(map.has('head-e')).toBeFalse();
    expect(map.has('head-w')).toBeFalse();
    expect(map.get('area-height')).toBe(130);
    expect(map.has('foot-e')).toBeFalse();
    expect(map.has('foot-w')).toBeFalse();
    expect(map.get('margin-bottom')).toBe(40);
    // width details
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-1-left-w')).toBe(5);
    expect(map.get('col-1-width')).toBe(50);
    expect(map.get('col-1-right-w')).toBe(5);
    expect(map.get('col-1-gap')).toBe(10);
    expect(map.get('col-2-left-w')).toBe(5);
    expect(map.get('col-2-width')).toBe(50);
    expect(map.get('col-2-right-w')).toBe(5);
    expect(map.get('margin-right')).toBe(15);
  });

  it('should count 2 cols in ' + text1, () => {
    const r = service.parseFormula(text1);
    expect(r.error).toBeFalsy();
    expect(r.value).toBeTruthy();
    expect(service.getColumnCount(r.value!)).toBe(2);
  });

  it('should get height rects from ' + text1, () => {
    const r = service.parseFormula(text1);
    expect(r.error).toBeFalsy();
    expect(r.value).toBeTruthy();
    const rects = service.getHeightRects(r.value!);
    expect(rects.length).toBe(5);
    expect(rects[0].name).toBe('margin-top');
    expect(rects[1].name).toBe('head-e');
    expect(rects[2].name).toBe('area-height');
    expect(rects[3].name).toBe('foot-w');
    expect(rects[4].name).toBe('margin-bottom');
    expect(
      rects.reduce((a, b) => {
        return a + b.value;
      }, 0)
    ).toBe(250);
  });

  it('should get width rects from ' + text1, () => {
    const r = service.parseFormula(text1);
    expect(r.error).toBeFalsy();
    expect(r.value).toBeTruthy();
    const rects = service.getWidthRects(r.value!);
    expect(rects.length).toBe(9);
    expect(rects[0].name).toBe('margin-left');
    expect(rects[1].name).toBe('col-1-left-w');
    expect(rects[2].name).toBe('col-1-width');
    expect(rects[3].name).toBe('col-1-right-e');
    expect(rects[4].name).toBe('col-1-gap');
    expect(rects[5].name).toBe('col-2-left-w');
    expect(rects[6].name).toBe('col-2-width');
    expect(rects[7].name).toBe('col-2-right-e');
    expect(rects[8].name).toBe('margin-right');
    expect(
      rects.reduce((a, b) => {
        return a + b.value;
      }, 0)
    ).toBe(160);
  });

  // build
  // h w | mt he/hw ah fw/fe mb | ml [cle/clw cw cre/crw gap]+ mr
  it('should build all-0 formula from empty', () => {
    const map = new Map<string, number>();
    const f = service.buildFormula(map);
    expect(f).toBe('');
  });

  it('should build 1-column formula clw-cw-crw', () => {
    const f1 = '250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15';
    const map = service.parseFormula(f1).value!;
    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  it('should build formula with 0 for missing dimensions', () => {
    const f1 = '250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15';
    const map = service.parseFormula(f1).value!;
    map.delete('area-height');
    const f2 = service.buildFormula(map);
    expect(f2).toBe('250 × 160 = 30 / 5 [0 / 5] 40 × 15 [3 / 50 / 5] 15');
  });

  it('should build 1-column cle-cw-crw formula', () => {
    const f1 = '250 × 160 = 30 / 5 [170 / 5] 40 × 15 / 3 [50 / 5] 15';
    const map = service.parseFormula(f1).value!;
    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  it('should build 1-column clw-cw-cre formula', () => {
    const f1 = '250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50] 5 / 15';
    const map = service.parseFormula(f1).value!;
    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  it('should build 1-column cle-cw-cre formula', () => {
    const f1 = '250 × 160 = 30 / 5 [170 / 5] 40 × 15 / 3 [50] 5 / 15';
    const map = service.parseFormula(f1).value!;
    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  it('should build 2-columns formula', () => {
    const f1 =
      '250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15';
    const map = service.parseFormula(f1).value!;
    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  it('should build no head-foot formula', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [5 / 50 / 5* (10) 5* / 50 / 5] 15';
    const map = service.parseFormula(f1).value!;
    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // height (mt he hw ah fe fe mb)
  // mt ah mb
  it('should parse & build mt ah mb', () => {
    const f1 = '200 × 200 = 30 [130] 40 × 30 / 5 [130] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('height')).toBe(200);
    expect(map.get('margin-top')).toBe(30);
    expect(map.has('head-e')).toBeFalse();
    expect(map.has('head-w')).toBeFalse();
    expect(map.get('area-height')).toBe(130);
    expect(map.has('foot-e')).toBeFalse();
    expect(map.has('foot-w')).toBeFalse();
    expect(map.get('margin-bottom')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // mt he ah mb
  it('should parse & build mt he ah mb', () => {
    const f1 = '200 × 200 = 30 / 10 [120] 40 × 30 / 5 [130] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('height')).toBe(200);
    expect(map.get('margin-top')).toBe(30);
    expect(map.get('head-e')).toBe(10);
    expect(map.has('head-w')).toBeFalse();
    expect(map.get('area-height')).toBe(120);
    expect(map.has('foot-e')).toBeFalse();
    expect(map.has('foot-w')).toBeFalse();
    expect(map.get('margin-bottom')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // mt hw ah mb
  it('should parse & build mt hw ah mb', () => {
    const f1 = '200 × 200 = 30 [10 / 120] 40 × 30 / 5 [130] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('height')).toBe(200);
    expect(map.get('margin-top')).toBe(30);
    expect(map.has('head-e')).toBeFalse();
    expect(map.get('head-w')).toBe(10);
    expect(map.get('area-height')).toBe(120);
    expect(map.has('foot-e')).toBeFalse();
    expect(map.has('foot-w')).toBeFalse();
    expect(map.get('margin-bottom')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // mt ah fe mb
  it('should parse & build mt ah fe mb', () => {
    const f1 = '200 × 200 = 30 [120] 10 / 40 × 30 / 5 [130] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('height')).toBe(200);
    expect(map.get('margin-top')).toBe(30);
    expect(map.has('head-e')).toBeFalse();
    expect(map.has('head-w')).toBeFalse();
    expect(map.get('area-height')).toBe(120);
    expect(map.get('foot-e')).toBe(10);
    expect(map.has('foot-w')).toBeFalse();
    expect(map.get('margin-bottom')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // mt ah fw mb
  it('should parse & build mt ah fw mb', () => {
    const f1 = '200 × 200 = 30 [120 / 10] 40 × 30 / 5 [130] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('height')).toBe(200);
    expect(map.get('margin-top')).toBe(30);
    expect(map.has('head-e')).toBeFalse();
    expect(map.has('head-w')).toBeFalse();
    expect(map.get('area-height')).toBe(120);
    expect(map.has('foot-e')).toBeFalse();
    expect(map.get('foot-w')).toBe(10);
    expect(map.get('margin-bottom')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // mt he ah fe mb
  it('should parse & build mt he ah fe mb', () => {
    const f1 = '200 × 200 = 30 / 5 [120] 5 / 40 × 30 / 5 [130] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('height')).toBe(200);
    expect(map.get('margin-top')).toBe(30);
    expect(map.get('head-e')).toBe(5);
    expect(map.has('head-w')).toBeFalse();
    expect(map.get('area-height')).toBe(120);
    expect(map.get('foot-e')).toBe(5);
    expect(map.has('foot-w')).toBeFalse();
    expect(map.get('margin-bottom')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // mt he ah fw mb
  it('should parse & build mt he ah fw mb', () => {
    const f1 = '200 × 200 = 30 / 5 [120 / 5] 40 × 30 / 5 [130] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('height')).toBe(200);
    expect(map.get('margin-top')).toBe(30);
    expect(map.get('head-e')).toBe(5);
    expect(map.has('head-w')).toBeFalse();
    expect(map.get('area-height')).toBe(120);
    expect(map.has('foot-e')).toBeFalse();
    expect(map.get('foot-w')).toBe(5);
    expect(map.get('margin-bottom')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // mt hw ah fe mb
  it('should parse & build mt hw ah fe mb', () => {
    const f1 = '200 × 200 = 30 [5 / 120] 5 / 40 × 30 / 5 [130] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('height')).toBe(200);
    expect(map.get('margin-top')).toBe(30);
    expect(map.has('head-e')).toBeFalse();
    expect(map.get('head-w')).toBe(5);
    expect(map.get('area-height')).toBe(120);
    expect(map.get('foot-e')).toBe(5);
    expect(map.has('foot-w')).toBeFalse();
    expect(map.get('margin-bottom')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // mt hw ah fw mb
  it('should parse & build mt hw ah fw mb', () => {
    const f1 = '200 × 200 = 30 [5 / 120 / 5] 40 × 30 / 5 [130] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('height')).toBe(200);
    expect(map.get('margin-top')).toBe(30);
    expect(map.has('head-e')).toBeFalse();
    expect(map.get('head-w')).toBe(5);
    expect(map.get('area-height')).toBe(120);
    expect(map.has('foot-e')).toBeFalse();
    expect(map.get('foot-w')).toBe(5);
    expect(map.get('margin-bottom')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // width - 1 column (ml cle clw cw crw cre mr)
  // ml cw mr
  it('should parse & build ml cw mr', () => {
    const f1 = '200 × 200 = 30 [130] 40 × 30 [130] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(30);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(130);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.has('col-1-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // ml cle cw mr
  it('should parse & build ml cle cw mr', () => {
    const f1 = '200 × 200 = 30 [130] 40 × 30 / 10 [120] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(30);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.get('col-1-left-e')).toBe(10);
    expect(map.get('col-1-width')).toBe(120);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.has('col-1-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // ml clw cw mr
  it('should parse & build ml clw cw mr', () => {
    const f1 = '200 × 200 = 30 [130] 40 × 30 [10 / 120] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(30);
    expect(map.get('col-1-left-w')).toBe(10);
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(120);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.has('col-1-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // ml cw cre mr
  it('should parse & build ml cw cre mr', () => {
    const f1 = '200 × 200 = 30 [130] 40 × 30 [120] 10 / 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(30);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(120);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.get('col-1-right-e')).toBe(10);
    expect(map.has('col-1-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // ml cw crw mr
  it('should parse & build ml cw crw mr', () => {
    const f1 = '200 × 200 = 30 [130] 40 × 30 [120 / 10] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(30);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(120);
    expect(map.get('col-1-right-w')).toBe(10);
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.has('col-1-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // ml cle cw cre mr
  it('should parse & build ml cle cw cre mr', () => {
    const f1 = '200 × 200 = 30 [130] 40 × 30 / 5 [120] 5 / 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(30);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.get('col-1-left-e')).toBe(5);
    expect(map.get('col-1-width')).toBe(120);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.get('col-1-right-e')).toBe(5);
    expect(map.has('col-1-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // ml cle cw crw mr
  it('should parse & build ml cle cw crw mr', () => {
    const f1 = '200 × 200 = 30 [130] 40 × 30 / 5 [120 / 5] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(30);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.get('col-1-left-e')).toBe(5);
    expect(map.get('col-1-width')).toBe(120);
    expect(map.get('col-1-right-w')).toBe(5);
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.has('col-1-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // ml clw cw cre mr
  it('should parse & build ml clw cw cre mr', () => {
    const f1 = '200 × 200 = 30 [130] 40 × 30 [5 / 120] 5 / 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(30);
    expect(map.get('col-1-left-w')).toBe(5);
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(120);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.get('col-1-right-e')).toBe(5);
    expect(map.has('col-1-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // ml clw cw crw mr
  it('should parse & build ml clw cw crw mr', () => {
    const f1 = '200 × 200 = 30 [130] 40 × 30 [5 / 120 / 5] 40';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(30);
    expect(map.get('col-1-left-w')).toBe(5);
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(120);
    expect(map.get('col-1-right-w')).toBe(5);
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.has('col-1-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(40);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // width - 2 columns (ml clw1 cle1 cw1 crw1 cre1 cg clw2 cle2 cw2 crw2 cre2 mr)
  // cw1 cg
  it('should parse & build cw1 cg', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(60);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.get('col-1-gap')).toBe(10);
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // clw1 cw1 cg
  it('should parse & build clw1 cw1 cg', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [5 / 55 (10) 60] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-1-left-w')).toBe(5);
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(55);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.get('col-1-gap')).toBe(10);
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // cle1 cw1 cg
  it('should parse & build cle1 cw1 cg', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 / 5 [55 (10) 60] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.get('col-1-left-e')).toBe(5);
    expect(map.get('col-1-width')).toBe(55);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.get('col-1-gap')).toBe(10);
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // cw1 crw1 cg
  it('should parse & build cw1 crw1 cg', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [55 / 5 (10) 60] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(55);
    expect(map.get('col-1-right-w')).toBe(5);
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.get('col-1-gap')).toBe(10);
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // cw1 cre1 cg
  it('should parse & build cw1 cre1 cg', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [55 / 5* (10) 60] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(55);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.get('col-1-right-e')).toBe(5);
    expect(map.get('col-1-gap')).toBe(10);
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // clw1 cw1 crw1 cg
  it('should parse & build clw1 cw1 crw1 cg', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [5 / 50 / 5 (10) 60] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-1-left-w')).toBe(5);
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(50);
    expect(map.get('col-1-right-w')).toBe(5);
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.get('col-1-gap')).toBe(10);
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // clw1 cw1 cre1 cg
  it('should parse & build clw1 cw1 cre1 cg', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [5 / 50 / 5* (10) 60] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-1-left-w')).toBe(5);
    expect(map.has('col-1-left-e')).toBeFalse();
    expect(map.get('col-1-width')).toBe(50);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.get('col-1-right-e')).toBe(5);
    expect(map.get('col-1-gap')).toBe(10);
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // cle1 cw1 crw1 cg
  it('should parse & build cle1 cw1 crw1 cg', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 / 5 [50 / 5 (10) 60] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.get('col-1-left-e')).toBe(5);
    expect(map.get('col-1-width')).toBe(50);
    expect(map.get('col-1-right-w')).toBe(5);
    expect(map.has('col-1-right-e')).toBeFalse();
    expect(map.get('col-1-gap')).toBe(10);
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // cle1 cw1 cre1 cg
  it('should parse & build cle1 cw1 cre1 cg', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 / 5 [50 / 5* (10) 60] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-1-left-w')).toBeFalse();
    expect(map.get('col-1-left-e')).toBe(5);
    expect(map.get('col-1-width')).toBe(50);
    expect(map.has('col-1-right-w')).toBeFalse();
    expect(map.get('col-1-right-e')).toBe(5);
    expect(map.get('col-1-gap')).toBe(10);
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // width - 2 columns - second column
  // cw2
  it('should parse & build cw2 at col.2', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-2-left-w')).toBeFalse();
    expect(map.has('col-2-left-e')).toBeFalse();
    expect(map.get('col-2-width')).toBe(60);
    expect(map.has('col-2-right-w')).toBeFalse();
    expect(map.has('col-2-right-e')).toBeFalse();
    expect(map.has('col-2-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // clw2 cw2
  it('should parse & build clw2 cw2 at col.2', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [60 (10) 5 / 55] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-2-left-w')).toBe(5);
    expect(map.has('col-2-left-e')).toBeFalse();
    expect(map.get('col-2-width')).toBe(55);
    expect(map.has('col-2-right-w')).toBeFalse();
    expect(map.has('col-2-right-e')).toBeFalse();
    expect(map.has('col-2-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // cle2 cw2
  it('should parse & build cle2 cw2 at col.2', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [60 (10) 5* / 55] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-2-left-w')).toBeFalse();
    expect(map.get('col-2-left-e')).toBe(5);
    expect(map.get('col-2-width')).toBe(55);
    expect(map.has('col-2-right-w')).toBeFalse();
    expect(map.has('col-2-right-e')).toBeFalse();
    expect(map.has('col-2-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // cw2 crw2
  it('should parse & build cw2 crw2 at col.2', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [60 (10) 55 / 5] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-2-left-w')).toBeFalse();
    expect(map.has('col-2-left-e')).toBeFalse();
    expect(map.get('col-2-width')).toBe(55);
    expect(map.get('col-2-right-w')).toBe(5);
    expect(map.has('col-2-right-e')).toBeFalse();
    expect(map.has('col-2-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // cw2 cre2
  it('should parse & build cw2 cre2 at col.2', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [60 (10) 55] 5 / 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-2-left-w')).toBeFalse();
    expect(map.has('col-2-left-e')).toBeFalse();
    expect(map.get('col-2-width')).toBe(55);
    expect(map.has('col-2-right-w')).toBeFalse();
    expect(map.get('col-2-right-e')).toBe(5);
    expect(map.has('col-2-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // clw2 cw2 crw2
  it('should parse & build clw2 cw2 crw2 at col.2', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [60 (10) 5 / 50 / 5] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-2-left-w')).toBe(5);
    expect(map.has('col-2-left-e')).toBeFalse();
    expect(map.get('col-2-width')).toBe(50);
    expect(map.get('col-2-right-w')).toBe(5);
    expect(map.has('col-2-right-e')).toBeFalse();
    expect(map.has('col-2-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // clw2 cw2 cre2
  it('should parse & build clw2 cw2 cre2 at col.2', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [60 (10) 5 / 50] 5 / 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.get('col-2-left-w')).toBe(5);
    expect(map.has('col-2-left-e')).toBeFalse();
    expect(map.get('col-2-width')).toBe(50);
    expect(map.has('col-2-right-w')).toBeFalse();
    expect(map.get('col-2-right-e')).toBe(5);
    expect(map.has('col-2-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // cle2 cw2 crw2
  it('should parse & build cle2 cw2 crw2 at col.2', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [60 (10) 5* / 50 / 5] 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-2-left-w')).toBeFalse();
    expect(map.get('col-2-left-e')).toBe(5);
    expect(map.get('col-2-width')).toBe(50);
    expect(map.get('col-2-right-w')).toBe(5);
    expect(map.has('col-2-right-e')).toBeFalse();
    expect(map.has('col-2-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });

  // cle2 cw2 cre2
  it('should parse & build cle2 cw2 cre2 at col.2', () => {
    const f1 = '200 × 160 = 30 [130] 40 × 15 [60 (10) 5* / 50] 5 / 15';
    const map = service.parseFormula(f1).value!;
    expect(map.get('margin-left')).toBe(15);
    expect(map.has('col-2-left-w')).toBeFalse();
    expect(map.get('col-2-left-e')).toBe(5);
    expect(map.get('col-2-width')).toBe(50);
    expect(map.has('col-2-right-w')).toBeFalse();
    expect(map.get('col-2-right-e')).toBe(5);
    expect(map.has('col-2-gap')).toBeFalse();
    expect(map.get('margin-right')).toBe(15);

    const f2 = service.buildFormula(map);
    expect(f2).toBe(f1);
  });
});

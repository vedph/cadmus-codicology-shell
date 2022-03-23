import { Injectable } from '@angular/core';
/**
 * A generic wrapper for any object of type T, with an optional
 * error message and payload.
 */
export interface ErrorWrapper<T> {
  error?: {
    message: string;
    payload?: any;
  };
  value?: T;
}

/**
 * A rectangle in a visual representation of a MS layout formula.
 */
export interface CodLayoutRect {
  name: string;
  value: number;
  empty?: boolean;
}

/**
 * Rough validation regexp for MS layout formulas.
 * This just checks for ^NxN=...x...$ where ... include only a set of characters.
 */
export const COD_LAYOUT_FORMULA_REGEX =
  /^\d+\s*[Xx×]\s*\d+\s*=\s*[0-9\[\]\/ ]+[Xx×][0-9*()\[\]\/ ]+$/;

// Sample (portions marked with - and + are reciprocally exclusive; !=required, ?=optional):
//
// 240 × 150 = 30 / 5 [5 / 170 / 5] 5 / 40 × 15 / 5 [5 / 50 / 5* (20) 5* / 40 / 5] 5 / 15
//                ----++++    +++++----         ----++++       -  ||   -      ++++----
// hhh   www   hhhhhhhhhhhhhhhhhhhhhhhhhhh   wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
//                                              1111111111111111  ||  22222222222222
// h     w     mt he  hw   ah fw    fe  mb   ml cle clw  cw   crX cg  clX  cw crw cre  mr
// !     !     !  ? / ?    !  ?   / ?   !    !  ? / ?    !    ?   !   ?    !  ? / ?    !
//
// height:
//
// [mt   ]
// [he/hw]
// [ah   ]
// [fe/fw]
// [mb   ]
//
// width:
//      col1                   col2
// [ml] [cle/clw][cw][cre/crw] [cg][cle/clw][cw][cre/crw]... [mr]

const COD_LAYOUT_FIXED_KEYS = [
  'height',
  'width',
  'margin-top',
  'head-e',
  'head-w',
  'area-height',
  'foot-w',
  'foot-e',
  'margin-bottom',
  'margin-left',
  'margin-right',
];

/**
 * Manuscript's layout formula service.
 * Dimensions handled by formula are: height, width,
 * margin-top, head-e or head-w, area-height, foot-w or foot-e, margin-bottom,
 * margin-left, margin-right, col-N-gap, col-N-left-w or col-N-left-e,
 * col-N-width, col-N-right-w or col-N-right-e.
 * https://github.com/vedph/cadmus_itinera_doc/blob/master/models.md#mslayoutspart
 */

@Injectable({
  providedIn: 'root',
})
export class CodLayoutService {
  // sections: HxW=HxW
  // [1]=height
  // [2]=width
  // [3]=...height details
  // [4]=...width details
  private static readonly _sectRegex = /^(\d+)[Xx×](\d+)=([^Xx×]+)[Xx×](.+)$/;

  // height:
  // [1] = margin-top
  // [2] = head-e or
  // [3] = head-w
  // [4] = area-height
  // [5] = foot-w or
  // [6] = foot-e
  // [7] = margin-bottom
  private static readonly _heightRegex =
    // mt      /he?         [   hw/?       ah         /fw?       ]   fe/?     mb
    /^(\d+)(?:\/(\d+))?\[(?:(\d+)\/)?(\d+)(?:\/(\d+))?\](?:(\d+)\/)?(\d+)/;

  // width column. We first strip margins from both edges of width details;
  // then, we split what remains using the gap token as a delimiter.
  // Each split portion is a column, which is analyzed with this expression.
  // [1]=col-1-left-e (outside [) or
  // [2]=col-1-left-w or col-1-left-e when [3]=*
  // [3]=* modifier
  // [4]=col-1-width
  // [5]=col-1-right-w or col-1-right-e when [6]=* or
  // [6]=* modifier
  // [7]=col-1-right-e (outside ])
  // private static readonly _widthColRegex = new RegExp(
  //   // /?    cle       [    clw*/            cw        /crw*                ]cre
  //   '^\\/?(?:(\\d+))?\\[?(?:(\\d+)(\\*?)\\/)?(\\d+)?(?:\\/(\\d+)(\\*?))(?:\\](\\d+))?'
  // );

  // width: edges (margin-left, margin right) and gap
  private static readonly _wmlRegex = /^(\d+)\b/;
  private static readonly _wmrRegex = /\b(\d+)$/;
  // col-N-
  private static readonly _colNRegex = /^col-(\d+)-/;

  constructor() {}

  private parseHeightMatch(
    m: RegExpExecArray,
    result: Map<string, number>
  ): void {
    result.set('margin-top', +m[1]);
    if (m[2]) {
      result.set('head-e', +m[2]);
    }
    if (m[3]) {
      result.set('head-w', +m[3]);
    }
    result.set('area-height', +m[4]);
    if (m[5]) {
      result.set('foot-w', +m[5]);
    }
    if (m[6]) {
      result.set('foot-e', +m[6]);
    }
    result.set('margin-bottom', +m[7]);

    // apply a correction for the corner case [N/N] where it's ambiguous
    // whether we should interpret as hw/ah (the default, as the regular
    // expression is being matched from left to right), or rather ah/fw.
    // In this case, assume that it's ah/fw when ah<hw: [5/170]=hw/ah,
    // but [170/5]=ah/fw.
    if (result.has('head-w')) {
      const hw = result.get('head-w')!;
      const ah = result.get('area-height')!;
      if (ah < hw) {
        // hw is rather ah
        result.delete('head-w');
        result.set('area-height', hw);
        // ah is rather fw
        result.set('foot-w', ah);
      }
    }
  }

  private validateHeight(result: Map<string, any>): string | null {
    // no he/hw or fe/fw
    if (result.has('head-e') && result.has('head-w')) {
      return 'Inconsistent head: both empty and written head specified';
    }
    if (result.has('foot-e') && result.has('foot-w')) {
      return 'Inconsistent foot: both empty and written foot specified';
    }
    return null;
  }

  private parseColumn(
    col: string,
    coln: number,
    result: Map<string, number>
  ): string | null {
    const prefix = `col-${coln}-`;

    // a column has 1-3 N variously separated by / and [],
    // and eventually postfixed with * for empty shapes.
    // As the full columns set is in [], we just need to take
    // care of the only (if any) N before [, and the only
    // (if any) N after ].
    // So, just match ]N*[ where only N is required:
    // [1]=]
    // [2]=N
    // [3]=*
    // [4]=[
    const nrRegex = /(?:(\]?)(\d+)(\*)?(\[)?)/g;
    let m: RegExpExecArray | null;
    const nrMatches: RegExpExecArray[] = [];

    while ((m = nrRegex.exec(col))) {
      nrMatches.push(m);
      if (nrMatches.length > 3) {
        return `Too many numbers in column ${coln}: "${col}"`;
      }
    }

    switch (nrMatches.length) {
      // with 3 N, we have clx, cw, crx
      case 3:
        // cl=cle when N* or N[, else =clw
        const ml = nrMatches[0];
        const cle = ml[3] || ml[4];
        result.set(prefix + (cle ? 'left-e' : 'left-w'), +ml[2]);
        // cw
        result.set(prefix + 'width', +nrMatches[1][2]);
        // cr=cre when N* or ]N, else =crw
        const mr = nrMatches[2];
        const cre = mr[3] || mr[1];
        result.set(prefix + (cre ? 'right-e' : 'right-w'), +mr[2]);
        break;

      // with 2 N we have:
      // N* or N*: error (missing cw)
      // N* N or N N*: the N without * is cw
      // N N: the bigger is cw (error if equal)
      case 2:
        const a = nrMatches[0];
        const b = nrMatches[1];
        // N* N*
        if (a[3] && b[3]) {
          return `No width in column ${coln}: "${col}"`;
        }
        // N* N
        if (a[3]) {
          // a=cle, b=cw
          result.set(prefix + 'left-e', +a[2]);
          result.set(prefix + 'width', +b[2]);
        } else {
          // N N*
          if (b[3]) {
            // a=cw, b=cre
            result.set(prefix + 'width', +a[2]);
            result.set(prefix + 'right-e', +b[2]);
          } else {
            // N N
            if (+a[2] === +b[2]) {
              return `Ambiguous values for column ${coln}: ${col}`;
            }
            if (+a[2] > +b[2]) {
              // a=cw, b=crx (cre of ]N, else crw; * is excluded)
              result.set(prefix + 'width', +a[2]);
              result.set(prefix + 'right-' + (b[1] ? 'e' : 'w'), +b[2]);
            } else {
              // a=clx, b=cw (cle if [N, else clw; * is excluded)
              result.set(prefix + 'left-' + (a[4] ? 'e' : 'w'), +a[2]);
              result.set(prefix + 'width', +b[2]);
            }
          }
        }
        break;

      // with 1 N, we just have cw
      case 1:
        // col-N-width
        result.set(prefix + 'width', +nrMatches[0][2]);
        break;

      // no N is an error
      case 0:
        return `Empty column ${coln}: "${col}"`;
    }

    return null;
  }

  /**
   * Parse the specified layout formula.
   *
   * @param text The text to parse.
   * @returns A map with key=dimension name and value=its numeric value,
   * wrapped inside an error wrapper. In case of errors, the wrapper has
   * its error object and a null map.
   */
  public parseFormula(
    text?: string | null
  ): ErrorWrapper<Map<string, number> | null> {
    if (!text) {
      return { value: null };
    }
    // remove whitespaces
    text = text.replace(/\s+/g, '');

    // match main sections
    const m = CodLayoutService._sectRegex.exec(text);
    if (!m) {
      return {
        error: {
          message: 'Invalid formula (expected H x W = height x width)',
        },
      };
    }

    // total height and width
    const result = new Map();
    result.set('height', +m[1]);
    result.set('width', +m[2]);

    // height details
    const hm = CodLayoutService._heightRegex.exec(m[3]);
    if (!hm) {
      return {
        error: {
          message: 'Invalid height details',
          payload: m[3],
        },
      };
    }
    this.parseHeightMatch(hm, result);

    // ensure that there are no inconsistencies: he/hw or fe/fw
    // cannot be both present in the same formula
    const hError = this.validateHeight(result);
    if (hError) {
      return {
        error: {
          message: hError,
          payload: m[3],
        },
      };
    }

    // width details:
    // read margin-left and margin-right from edges
    const ml = CodLayoutService._wmlRegex.exec(m[4]);
    if (!ml) {
      return {
        error: {
          message: 'Missing left margin in width details',
          payload: m[4],
        },
      };
    }
    result.set('margin-left', +ml[1]);

    const mr = CodLayoutService._wmrRegex.exec(m[4]);
    if (!mr) {
      return {
        error: {
          message: 'Missing right margin in width details',
          payload: m[4],
        },
      };
    }
    result.set('margin-right', +mr[1]);

    // strip margins thus getting columns only
    let cols = m[4].substr(ml[0].length, mr.index - ml[0].length);

    // for each gap (which separates two columns), process
    // the left portion as a column
    const gapRegex = /\((\d+)\)/g;
    let mGap: RegExpExecArray | null;
    let start = 0;
    let coln = 0;
    while ((mGap = gapRegex.exec(cols))) {
      coln++;
      result.set(`col-${coln}-gap`, +mGap[1]);
      const col = cols.substr(start, mGap.index - start);
      const err = this.parseColumn(col, coln, result);
      if (err) {
        return {
          error: {
            message: err,
            payload: col,
          },
        };
      }
      start = mGap.index + mGap[0].length;
    }

    // process the last column if pending
    if (start < cols.length) {
      const err = this.parseColumn(cols.substr(start), ++coln, result);
      if (err) {
        return {
          error: {
            message: err,
            payload: cols,
          },
        };
      }
    }

    return {
      value: result,
    };
  }

  /**
   * Get all the possible keys (even when mutually exclusive) connected to
   * a MS layout formula, in their preferred order.
   *
   * @param columnCount The count of columns.
   * @param map The optional map got from parsing a formula. When this
   * map gets passed, the sorted keys get filtered by it, so that only
   * the keys present in the map are returned, yet in the preferred order.
   * @returns An array with all the possible keys in the preferred order.
   */
  public getSortedKeys(
    columnCount: number,
    map?: Map<string, number>
  ): string[] {
    // general + height
    const expected = [
      'height',
      'width',
      'margin-top',
      'head-e',
      'head-w',
      'area-height',
      'foot-w',
      'foot-e',
      'margin-bottom',
    ];
    // width
    expected.push('margin-left');
    for (let n = 1; n <= columnCount; n++) {
      expected.push(`col-${n}-left-e`);
      expected.push(`col-${n}-left-w`);
      expected.push(`col-${n}-width`);
      expected.push(`col-${n}-right-w`);
      expected.push(`col-${n}-right-e`);
      expected.push(`col-${n}-gap`);
    }
    expected.push('margin-right');

    // filter if requested
    if (map) {
      for (let i = expected.length - 1; i > -1; i--) {
        if (!map.has(expected[i])) {
          expected.splice(i, 1);
        }
      }
    }

    return expected;
  }

  /**
   * Build the manuscript's layout formula from a set of measurements.
   *
   * @param map The map with the measurements related to a formula.
   * @returns Formula; where required numbers are missing, they are
   * represented by 0.
   */
  public buildFormula(map: Map<string, number>): string {
    if (!map.has('height') || !map.has('width')) {
      return '';
    }
    const sb: string[] = [];
    // height x width
    sb.push(`${map.get('height') || 0}`);
    sb.push(' × ');
    sb.push(`${map.get('width') || 0}`);
    sb.push(' = ');

    // height details
    // mt
    sb.push(`${map.get('margin-top') || 0}`);
    // /he[ or [hw/
    let n: number | undefined;
    n = map.get('head-e');
    if (n) {
      sb.push(` / ${n} [`);
    } else {
      n = map.get('head-w') || 0;
      if (n) {
        sb.push(` [${n} / `);
      } else {
        sb.push(' [');
      }
    }
    // ah
    sb.push(`${map.get('area-height') || 0}`);
    // /fw] or ]fe/
    n = map.get('foot-w');
    if (n) {
      sb.push(` / ${n}] `);
    } else {
      n = map.get('foot-e');
      if (n) {
        sb.push(`] ${n} / `);
      } else {
        sb.push('] ');
      }
    }
    // mb
    sb.push(`${map.get('margin-bottom') || 0}`);

    // width details
    const colCount = this.getColumnCount(map);
    sb.push(' × ');
    // ml
    sb.push(`${map.get('margin-left') || 0}`);

    let cre = false;
    // for each column:
    for (let col = 1; col <= colCount; col++) {
      // first col: /cle[ or [clw/
      if (col === 1) {
        n = map.get('col-1-left-e');
        if (n) {
          sb.push(` / ${n} [`);
        } else {
          n = map.get('col-1-left-w');
          if (n) {
            sb.push(` [${n} / `);
          } else {
            sb.push(' [');
          }
        }
      } else {
        // other cols: /cle*/ or /clw/
        n = map.get(`col-${col}-left-e`);
        if (n) {
          sb.push(`${n}* / `);
        } else {
          n = map.get(`col-${col}-left-w`);
          if (n) {
            sb.push(`${n} / `);
          }
        }
      }

      // cw
      sb.push(`${map.get(`col-${col}-width`) || 0}`);

      // /cre* (or ]cre/ if last) or /crw
      n = map.get(`col-${col}-right-e`);
      if (n) {
        if (col === colCount) {
          sb.push(`] ${n} / `);
          cre = true;
        } else {
          sb.push(` / ${n}*`);
        }
      } else {
        n = map.get(`col-${col}-right-w`);
        if (n) {
          sb.push(` / ${n}`);
        }
      }
      // (gap)
      if (col < colCount) {
        n = map.get(`col-${col}-gap`) || 0;
        sb.push(` (${n}) `);
      }
    }
    // ]mr (or just mr if ]cre/)
    if (!cre) {
      sb.push('] ');
    }
    sb.push(`${map.get('margin-right') || 0}`);

    return sb.join('');
  }

  private getRects(map: Map<string, number>, keys: string[]): CodLayoutRect[] {
    const rects: CodLayoutRect[] = [];
    keys.forEach((key) => {
      if (map.has(key)) {
        rects.push({
          name: key,
          value: map.get(key)!,
          empty:
            key.endsWith('-e') ||
            key.endsWith('-gap') ||
            key.startsWith('margin-'),
        });
      }
    });
    return rects;
  }

  /**
   * Get the array of rectangles representing the dimensions parsed from
   * a formula along the sheet's height.
   *
   * @param map The map of dimensions as parsed by parseFormula.
   * @returns An array of rectangles.
   */
  public getHeightRects(map: Map<string, number>): CodLayoutRect[] {
    return this.getRects(map, [
      'margin-top',
      'head-e',
      'head-w',
      'area-height',
      'foot-e',
      'foot-w',
      'margin-bottom',
    ]);
  }

  /**
   * Returns true if the specified measurement key belongs to the set
   * of measurement keys handled by the layout formula.
   *
   * @param key The measurement key.
   */
  public isLayoutMeasure(key: string): boolean {
    if (!key) {
      return false;
    }
    if (COD_LAYOUT_FIXED_KEYS.indexOf(key) > -1) {
      return true;
    }
    return /^col-\d+-(?:left-e|left-w|width|right-e|right-w|gap)$/.test(key);
  }

  /**
   * Get the count of columns in the specified map.
   *
   * @param map The map of dimensions as parsed by parseFormula.
   * @returns The count of columns.
   */
  public getColumnCount(map: Map<string, number>): number {
    let colMax = 0;
    map.forEach((value, key) => {
      const m = CodLayoutService._colNRegex.exec(key);
      if (m) {
        const n = +m[1];
        if (n > colMax) {
          colMax = n;
        }
      }
    });
    return colMax;
  }

  /**
   * Get the array of rectangles representing the dimensions parsed from
   * a formula along the sheet's width.
   *
   * @param map The map of dimensions as parsed by parseFormula.
   * @returns An array of rectangles.
   */
  public getWidthRects(map: Map<string, number>): CodLayoutRect[] {
    const keys: string[] = [];
    keys.push('margin-left');

    const colCount = this.getColumnCount(map);
    for (let n = 1; n <= colCount; n++) {
      keys.push(`col-${n}-left-e`);
      keys.push(`col-${n}-left-w`);
      keys.push(`col-${n}-width`);
      keys.push(`col-${n}-right-e`);
      keys.push(`col-${n}-right-w`);
      if (n < colCount) {
        keys.push(`col-${n}-gap`);
      }
    }

    keys.push('margin-right');
    return this.getRects(map, keys);
  }
}

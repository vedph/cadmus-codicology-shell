import { RomanNumber } from '@myrmidon/ng-tools';

import { CodColumn } from './cod-sheet-labels-part';
import { CodRowPage, CodRowType } from './cod-sheet-table';

export interface CodLabelCell extends CodColumn {
  rowId: string;
}

/**
 * The default label action to generate labeled columns.
 */
export interface CodLabelAction {
  type: CodLabelActionType;
  n: number;
  v: boolean;
  qn?: number;
  qs?: number;
  page?: boolean;
  count: number;
  value?: string;
}

export enum CodLabelActionType {
  Custom = 0,
  Arabic,
  UpperRoman,
  LowerRoman,
  LatUpperLetter,
  LatLowerLetter,
  GrcUpperLetter,
  GrcLowerLetter,
  Quire,
}

/**
 * A set-label action. This does not generate columns, but just sets
 * their values when matched.
 */
export interface CodLabelSetAction {
  pages: CodRowPage[];
  value?: string;
}

/**
 * Labels generator.
 */
export class LabelGenerator {
  // default action:
  // 1=n
  // 2=r/v
  // 3=* (sheet) or % (page)
  // 4=count
  // 5=value (if in "" this forces custom type; if qN/N is a quire;
  //          for quires we assume always r, never v).
  // ^(?:(\(?)?(\/)?([0-9]+)([rv])?\)?[-\s*])+:=
  public static PATTERN: RegExp =
    /^([0-9]+)([rv])?\s*([x*%])\s*([0-9]+)\s*=\s*([^\s]*)/;

  // set-action:
  // any number of locations or location ranges (location-location)
  // separated by space and followed by := (rather than just =)
  public static SET_PATTERN: RegExp =
    /^(?:(\(?)?(\/)?([0-9]+)([rv])?\)?[-\s*])+:=(.*)/;

  // default or set action (for validation)
  public static ANY_PATTERN: RegExp =
    /^(?:(?:(?:(\(?)?(\/)?([0-9]+)([rv])?\)?[-\s*]?)+:=(.*))|(?:([0-9]+)([rv])?\s*([x*%])\s*([0-9]+)\s*=\s*([^\s]*)))/;

  private static parseSetActionEntry(
    m: RegExpExecArray,
    baseIndex: number
  ): CodRowPage | null {
    if (!m[3 + baseIndex]) {
      return null;
    }
    return {
      type: m[1 + baseIndex]
        ? m[2 + baseIndex]
          ? CodRowType.EndleafBack
          : CodRowType.EndleafFront
        : CodRowType.Body,
      n: +m[3 + baseIndex],
      v: m[4 + baseIndex] === 'v',
    };
  }

  /**
   * Parse the specified text representing a set action.
   *
   * @param text The action text to be parsed.
   * @returns The action.
   */
  public static parseSetAction(text: string): CodLabelSetAction | null {
    const i = text.indexOf(':=');
    const tokens = text.substring(0, i).split(' ');
    const value = text.substring(i + 2);
    const pages: CodRowPage[] = [];
    // location (A) or location range (A-B):
    // A1/B5=(
    // A2/B6=/
    // A3/B7=n
    // A4/B8=rv
    const r = /^(\()?(\/)?([0-9]+)([rv])?\)?(?:-(\()?(\/)?([0-9]+)([rv])?)?/;

    for (let i = 0; i < tokens.length; i++) {
      const m = r.exec(tokens[i]);
      if (m) {
        let a = this.parseSetActionEntry(m, 0)!;
        let b = this.parseSetActionEntry(m, 4);
        if (!b) {
          pages.push(a);
        } else {
          // ensure that A comes before B
          if (a.n > b.n) {
            [a, b] = [b, a];
          }
          // expand range
          let v = a.v;
          for (let n = a.n; n <= b.n; n++) {
            pages.push({
              ...a,
              n: n,
              v: v,
            });
            v = !v;
            if (v) {
              pages.push({
                ...a,
                n: n,
                v: true,
              });
            }
            v = !v;
          }
        }
      }
    }
    return pages.length
      ? {
          pages: pages,
          value: value,
        }
      : null;
  }

  /**
   * Parse the specified text representing a labels insert action.
   * @param text The text.
   * @returns The action or null if invalid.
   */
  public static parseAction(
    text: string | null | undefined
  ): CodLabelAction | CodLabelSetAction | null {
    if (!text) {
      return null;
    }

    // is this a set action?
    let m = LabelGenerator.SET_PATTERN.exec(text);
    if (m) {
      return this.parseSetAction(text);
    }

    // default action
    m = LabelGenerator.PATTERN.exec(text);
    if (!m) {
      return null;
    }

    const action: CodLabelAction = {
      n: +m[1],
      v: m[2] === 'v',
      page: m[3] === '%',
      count: +m[4],
      value: m[5] || '',
      type: CodLabelActionType.Custom,
    };

    // handle corner cases for value first
    if (action.value) {
      // corner case: value in ""
      if (
        action.value.length > 2 &&
        action.value.charAt(0) === '"' &&
        action.value.charAt(action.value.length - 1) === '"'
      ) {
        action.value = action.value.substring(1, action.value.length - 1);
        return action;
      }

      // corner case: value like qN/N (quire)
      const qm = /^q([0-9]+)\/([0-9]+)$/.exec(action.value);
      if (qm) {
        action.type = CodLabelActionType.Quire;
        action.v = false;
        action.page = false;
        action.qn = +qm[1];
        action.qs = +qm[2];
        return action;
      }
    }

    // determine value type:
    // - Arabic number
    if (/^[0-9]+$/.test(action.value!)) {
      action.type = CodLabelActionType.Arabic;
      return action;
    }
    // - Roman number
    if (/^[IVXLCM]+$/.test(action.value!)) {
      action.type = CodLabelActionType.UpperRoman;
    } else if (/^[ivxlcm]+$/.test(action.value!)) {
      action.type = CodLabelActionType.LowerRoman;
    }
    // if mixed case, assume uppercase
    else if (/^[ivxlcmIVXLCM]+$/.test(action.value!)) {
      action.type = CodLabelActionType.UpperRoman;
    }
    // - single Latin letter
    else if (/^[a-z]$/.test(action.value!)) {
      action.type = CodLabelActionType.LatLowerLetter;
    } else if (/^[A-Z]$/.test(action.value!)) {
      action.type = CodLabelActionType.LatUpperLetter;
    }
    // - single Greek letter (Unicode alphabet, excluding waw koppa sampi)
    else if (/^[α-ω]$/.test(action.value!)) {
      action.type = CodLabelActionType.GrcLowerLetter;
    } else if (/^[Α-Ω]$/.test(action.value!)) {
      action.type = CodLabelActionType.GrcUpperLetter;
    }
    return action;
  }

  private static getNextRoman(roman: string, lower: boolean): string {
    let n = RomanNumber.fromRoman(roman.toUpperCase()) + 1;
    return lower
      ? RomanNumber.toRoman(n).toLowerCase()
      : RomanNumber.toRoman(n);
  }

  private static getNextLatLetter(c: string, lower: boolean): string {
    if (lower) {
      return c === 'z' ? 'a' : String.fromCharCode(c.charCodeAt(0) + 1);
    } else {
      return c === 'Z' ? 'A' : String.fromCharCode(c.charCodeAt(0) + 1);
    }
  }

  private static getNextGrcLetter(c: string, lower: boolean): string {
    if (lower) {
      return c === 'ω' ? 'α' : String.fromCharCode(c.charCodeAt(0) + 1);
    } else {
      return c === 'Ω' ? 'Α' : String.fromCharCode(c.charCodeAt(0) + 1);
    }
  }

  private static generateQuireRows(action: CodLabelAction): CodLabelCell[] {
    const cells: CodLabelCell[] = [];
    if (!action.qs || !action.qn) {
      return cells;
    }
    let n = action.n; // row number
    let qn = action.qn; // quire number
    let sn = 1; // sheet number

    // generate qn.sn/qs for each pair of r/v rows
    for (let i = 0; i < action.count * action.qs; i++) {
      const value = `${qn + Math.trunc(i / action.qs)}.${sn}/${action.qs}`;
      cells.push({
        rowId: n.toString() + 'r',
        id: 'q',
        value: value,
      });
      cells.push({
        rowId: n.toString() + 'v',
        id: 'q',
        value: value,
      });
      n++;
      if (++sn > action.qs) {
        sn = 1;
      }
    }
    return cells;
  }

  private static getNextValue(
    action: CodLabelAction,
    value?: string
  ): string | undefined {
    switch (action.type) {
      case CodLabelActionType.Arabic:
        value = (+value! + 1).toString();
        break;
      case CodLabelActionType.UpperRoman:
        value = this.getNextRoman(value!, false);
        break;
      case CodLabelActionType.LowerRoman:
        value = this.getNextRoman(value!, true);
        break;
      case CodLabelActionType.LatLowerLetter:
        value = this.getNextLatLetter(value!, true);
        break;
      case CodLabelActionType.LatUpperLetter:
        value = this.getNextLatLetter(value!, false);
        break;
      case CodLabelActionType.GrcLowerLetter:
        value = this.getNextGrcLetter(value!, true);
        break;
      case CodLabelActionType.GrcUpperLetter:
        value = this.getNextGrcLetter(value!, false);
        break;
      default:
        // a custom value remains the same forever
        break;
    }
    return value;
  }

  /**
   * Generate a set of label cells from the specified action.
   * @param columnId The column ID.
   * @param action The action.
   * @returns Generated cells.
   */
  public static generate(
    columnId: string,
    action: CodLabelAction
  ): CodLabelCell[] {
    if (!action) {
      return [];
    }
    // quire is a corner case
    if (action.type === CodLabelActionType.Quire) {
      return this.generateQuireRows(action);
    }

    const cells: CodLabelCell[] = [];
    let n = action.n;
    let v = action.v;
    const count = action.page ? action.count : action.count * 2;
    let value = action.value;
    for (let i = 0; i < count; i++) {
      cells.push({
        rowId: n.toString() + (v ? 'v' : 'r'),
        id: columnId,
        value: value + (action.page ? '' : v ? 'v' : 'r'),
      });
      // calculate next row ID
      if (v) {
        n++;
        v = false;
      } else {
        v = true;
      }
      // calculate new value
      if (action.page || !v) {
        value = this.getNextValue(action, value);
      }
    }
    return cells;
  }

  /**
   * Generate a set of label cells from a text representing a default label action.
   * @param columnId The column ID.
   * @param text The text to parse for the action.
   * @returns Generated cells.
   */
  public static generateFrom(columnId: string, text: string): CodLabelCell[] {
    const action = this.parseAction(text) as CodLabelAction;
    return action ? this.generate(columnId, action) : [];
  }
}

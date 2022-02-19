import { RomanNumber } from '@myrmidon/ng-tools';

export interface LabelCell {
  rowId: string;
  value?: string;
  note?: string;
}

export interface LabelAction {
  type: LabelActionType;
  n: number;
  v: boolean;
  qn?: number;
  qs?: number;
  page?: boolean;
  count: number;
  value?: string;
}

export enum LabelActionType {
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
 * Labels generator.
 */
export class LabelGenerator {
  // 1=n
  // 2=r/v
  // 3=* (sheet) or % (page)
  // 4=count
  // 5=value (if in "" this forces custom type; if qN/N is a quire;
  //          for quires we assume always r, never v).
  public static PATTERN: RegExp =
    /([0-9]+)([rv])?\s*([x*%])\s*([0-9]+)\s*=\s*([^\s]*)/;

  /**
   * Parse the specified text representing a labels insert action.
   * @param text The text.
   * @returns The action or null if invalid.
   */
  public static parseAction(
    text: string | null | undefined
  ): LabelAction | null {
    if (!text) {
      return null;
    }
    const m = LabelGenerator.PATTERN.exec(text);
    if (!m) {
      return null;
    }

    const action: LabelAction = {
      n: +m[1],
      v: m[2] === 'v',
      page: m[3] === '%',
      count: +m[4],
      value: m[5] || '',
      type: LabelActionType.Custom,
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
        action.type = LabelActionType.Quire;
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
      action.type = LabelActionType.Arabic;
      return action;
    }
    // - Roman number
    if (/^[IVXLCM]+$/.test(action.value!)) {
      action.type = LabelActionType.UpperRoman;
    } else if (/^[ivxlcm]+$/.test(action.value!)) {
      action.type = LabelActionType.LowerRoman;
    }
    // if mixed case, assume uppercase
    else if (/^[ivxlcmIVXLCM]+$/.test(action.value!)) {
      action.type = LabelActionType.UpperRoman;
    }
    // - single Latin letter
    else if (/^[a-z]$/.test(action.value!)) {
      action.type = LabelActionType.LatLowerLetter;
    } else if (/^[A-Z]$/.test(action.value!)) {
      action.type = LabelActionType.LatUpperLetter;
    }
    // - single Greek letter (Unicode alphabet, excluding waw koppa sampi)
    else if (/^[α-ω]$/.test(action.value!)) {
      action.type = LabelActionType.GrcLowerLetter;
    } else if (/^[Α-Ω]$/.test(action.value!)) {
      action.type = LabelActionType.GrcUpperLetter;
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

  private static generateQuireRows(action: LabelAction): LabelCell[] {
    const cells: LabelCell[] = [];
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
        value: value,
      });
      cells.push({
        rowId: n.toString() + 'v',
        value: value,
      });
      n++;
      if (++sn > action.qs) {
        sn = 1;
      }
    }
    return cells;
  }

  /**
   * Generate a set of label cells from the specified action.
   * @param action The action.
   * @returns Generated cells.
   */
  public static generate(action: LabelAction): LabelCell[] {
    if (!action) {
      return [];
    }
    // quire is a corner case
    if (action.type === LabelActionType.Quire) {
      return this.generateQuireRows(action);
    }

    const cells: LabelCell[] = [];
    let n = action.n;
    let v = action.v;
    let value = action.value;
    for (let i = 0; i < action.count; i++) {
      cells.push({
        rowId: n.toString() + (v ? 'v' : 'r'),
        value: value,
      });
      // calculate next row ID
      if (action.page) {
        if (v) {
          n++;
          v = false;
        } else {
          v = true;
        }
      } else {
        n++;
      }
      // calculate new value
      switch (action.type) {
        case LabelActionType.Arabic:
          value = (+value! + 1).toString();
          break;
        case LabelActionType.UpperRoman:
          value = this.getNextRoman(value!, false);
          break;
        case LabelActionType.LowerRoman:
          value = this.getNextRoman(value!, true);
          break;
        case LabelActionType.LatLowerLetter:
          value = this.getNextLatLetter(value!, true);
          break;
        case LabelActionType.LatUpperLetter:
          value = this.getNextLatLetter(value!, false);
          break;
        case LabelActionType.GrcLowerLetter:
          value = this.getNextGrcLetter(value!, true);
          break;
        case LabelActionType.GrcUpperLetter:
          value = this.getNextGrcLetter(value!, false);
          break;
        default:
          // a custom value remains the same forever
          break;
      }
    }
    return cells;
  }

  /**
   * Generate a set of label cells from a text representing an action.
   * @param text The text to parse for the action.
   * @returns Generated cells.
   */
  public static generateFrom(text: string): LabelCell[] {
    const action = this.parseAction(text);
    return action ? this.generate(action) : [];
  }
}

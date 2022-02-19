import { RomanNumber } from '@myrmidon/ng-tools';

export interface LabelCell {
  rowId: string;
  value?: string;
  note?: string;
}

export interface LabelAction {
  start: number;
  v: boolean;
  page?: boolean;
  count: number;
  value?: string;
  valueType: LabelActionValueType;
}

export enum LabelActionValueType {
  Custom = 0,
  Arabic,
  UpperRoman,
  LowerRoman,
  LatUpperLetter,
  LatLowerLetter,
  GrcUpperLetter,
  GrcLowerLetter,
}

/**
 * Labels generator.
 */
export class LabelGenerator {
  // 1=start nr
  // 2=r/v/nothing
  // 3=* (sheet) or % (page)
  // 4=count
  // 5=value (if in "" this forces custom type)
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
      start: +m[1],
      v: m[2] === 'v',
      page: m[3] === '%',
      count: +m[4],
      value: m[5] || '',
      valueType: LabelActionValueType.Custom,
    };

    // corner case: value in ""
    if (
      action.value!.length > 2 &&
      action.value!.charAt(0) === '"' &&
      action.value!.charAt(action.value!.length - 1) === '"'
    ) {
      action.value = action.value!.substring(1, action.value!.length - 1);
      return action;
    }

    // determine value type:
    // - Arabic number
    if (/^[0-9]+$/.test(action.value!)) {
      action.valueType = LabelActionValueType.Arabic;
      return action;
    }
    // - Roman number
    if (/^[IVXLCM]+$/.test(action.value!)) {
      action.valueType = LabelActionValueType.UpperRoman;
    } else if (/^[ivxlcm]+$/.test(action.value!)) {
      action.valueType = LabelActionValueType.LowerRoman;
    }
    // if mixed case, assume uppercase
    else if (/^[ivxlcmIVXLCM]+$/.test(action.value!)) {
      action.valueType = LabelActionValueType.UpperRoman;
    }
    // - single Latin letter
    else if (/^[a-z]$/.test(action.value!)) {
      action.valueType = LabelActionValueType.LatLowerLetter;
    } else if (/^[A-Z]$/.test(action.value!)) {
      action.valueType = LabelActionValueType.LatUpperLetter;
    }
    // - single Greek letter (Unicode alphabet, excluding waw koppa sampi)
    else if (/^[α-ω]$/.test(action.value!)) {
      action.valueType = LabelActionValueType.GrcLowerLetter;
    } else if (/^[Α-Ω]$/.test(action.value!)) {
      action.valueType = LabelActionValueType.GrcUpperLetter;
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

  /**
   * Generate a set of label cells from the specified action.
   * @param action The action.
   * @returns Generated cells.
   */
  public static generate(action: LabelAction): LabelCell[] {
    if (!action) {
      return [];
    }
    const cells: LabelCell[] = [];
    let n = action.start;
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
      switch (action.valueType) {
        case LabelActionValueType.Arabic:
          value = (+value! + 1).toString();
          break;
        case LabelActionValueType.UpperRoman:
          value = this.getNextRoman(value!, false);
          break;
        case LabelActionValueType.LowerRoman:
          value = this.getNextRoman(value!, true);
          break;
        case LabelActionValueType.LatLowerLetter:
          value = this.getNextLatLetter(value!, true);
          break;
        case LabelActionValueType.LatUpperLetter:
          value = this.getNextLatLetter(value!, false);
          break;
        case LabelActionValueType.GrcLowerLetter:
          value = this.getNextGrcLetter(value!, true);
          break;
        case LabelActionValueType.GrcUpperLetter:
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

import { BehaviorSubject, Observable } from 'rxjs';
import { CodRow } from './cod-sheet-labels-part';
import {
  CodLabelActionType,
  CodLabelCell,
  LabelGenerator,
} from './label-generator';

export enum CodRowType {
  EndleafFront = 0,
  Body,
  EndleafBack,
}

export interface CodRowViewModel extends CodRow {
  type: CodRowType;
  sheet: number;
  v: boolean;
}

export type CodColumnType = 'q' | 'n' | 'c' | 's' | 'r';

/**
 * Sheet labels table data. This represents the viewmodel for the sheet
 * labels table. This table has 3 rows sets for front endleaves, body,
 * and back endleaves, and any number of columns sets for each of the
 * available types (qncsr). There can be only 1 column of type q, always
 * named "q"; whereas all the other types allow any number of columns.
 * The table is edited so that we ensure that all the rows always have
 * the same columns, and their order follows the rules for both rows and
 * columns.
 * Rows are sorted first by type: front endleaf, body, back endleaf; and
 * then by their sheet number and recto/verso flag (1r, 1v, 2r, 2v...).
 * Endleaves IDs follow the same pattern, but are wrapped in "()" (front)
 * or "(/)" (back).
 * Columns are sorted first by type: qncsr; and then by their suffix,
 * which optionally follows the type letter plus a dot. So, "q" is the
 * default (and unique) quire column; "n" is the default numbering;
 * "n.roman" is another numbering; etc.
 */
export class CodSheetTable {
  private _cols$: BehaviorSubject<string[]>;
  private _rows$: BehaviorSubject<CodRowViewModel[]>;

  /**
   * The list of all the column IDs in the table, in their order.
   * Table columns are arranged in a fixed order: first by type,
   * then by their ID. Type order is q, n, c, s, r.
   */
  public get columnIds$(): Observable<string[]> {
    return this._cols$.asObservable();
  }

  /**
   * The rows in the table. Rows are sorted first by their type,
   * then by their number. Type order is front-endleaf, body,
   * back-endleaf. Each row has an ID built of a number and a r/v
   * flag.
   */
  public get rows$(): Observable<CodRowViewModel[]> {
    return this._rows$.asObservable();
  }

  constructor() {
    this._cols$ = new BehaviorSubject<string[]>([]);
    this._rows$ = new BehaviorSubject<CodRowViewModel[]>([]);
  }

  private buildColumnId(type: CodColumnType, suffix?: string): string {
    return suffix ? `${type}.${suffix}` : type;
  }

  /**
   * Add the specified column to the table. The column ID is calculated
   * from its type and suffix, and its position is determined by that ID.
   * If a column with the same ID already exists, nothing is done.
   *
   * @param type The type of the column to add.
   * @param suffix The optional column's ID suffix.
   */
  public addColumn(type: CodColumnType, suffix?: string): void {
    // build col ID and do nothing if already present
    const id = this.buildColumnId(type, suffix);
    if (this._cols$.value.includes(id)) {
      return;
    }
    // insert the new col at the right place
    const cols = [...this._cols$.value];
    let colIndex = cols.length - 1;
    while (colIndex > -1) {
      if (cols[colIndex].charAt(0) === type.charAt(0)) {
        break;
      }
    }
    cols.splice(colIndex + 1, 0, id);

    // insert the new col in each row
    const rows = [...this._rows$.value];
    for (let i = 0; i < rows.length; i++) {
      rows[i].columns.splice(colIndex, 0, {
        id: id,
      });
    }

    this._cols$.next(cols);
    this._rows$.next(rows);
  }

  /**
   * Delete the column with the specified ID.
   *
   * @param id The column ID.
   */
  public deleteColumn(id: string): void {
    const colIndex = this._cols$.value.indexOf(id);
    if (colIndex === -1) {
      return;
    }
    const cols = [...this._cols$.value];
    cols.splice(colIndex, 1);
    const rows = [...this._rows$.value];
    for (let i = 0; i < rows.length; i++) {
      rows[i].columns.splice(colIndex, 1);
    }

    this._cols$.next(cols);
    this._rows$.next(rows);
  }

  private buildRowId(type: CodRowType, n: number, v: boolean) {
    const rv = v ? 'v' : 'r';
    switch (type) {
      case CodRowType.EndleafFront:
        return `(${n}${rv})`;
      case CodRowType.EndleafFront:
        return `(/${n}${rv})`;
      default:
        return `${n}${rv}`;
    }
  }

  /**
   * Append the specified number of rows.
   *
   * @param type The type of the rows to append.
   * @param count The count of rows to be appended.
   */
  public appendRows(type: CodRowType, count: number): void {
    const rows = [...this._rows$.value];
    let n = 1,
      v = false;

    // locate last row of same type
    let lastRowIndex = rows.length - 1;
    while (lastRowIndex > -1 && rows[lastRowIndex].type !== type) {
      lastRowIndex--;
    }
    if (lastRowIndex > -1) {
      n = rows[lastRowIndex].sheet;
      v = rows[lastRowIndex].v;
    }
    for (let i = 0; i < count; i++) {
      // next page (each row is a page)
      if (v) {
        n++;
        v = false;
      } else {
        v = true;
      }
      rows.push({
        id: this.buildRowId(type, n, v),
        columns: new Array(this._cols$.value.length),
        type: type,
        sheet: n,
        v: v,
      });
    }

    this._rows$.next(rows);
  }

  /**
   * Update the specified cell in the table. If the cell is not found,
   * nothing is done.
   *
   * @param columnId The cell's column ID.
   * @param cell The cell value.
   */
  public updateCell(columnId: string, cell: CodLabelCell): void {
    const rows = [...this._rows$.value];
    const rowIndex = rows.findIndex((r) => r.id === cell.rowId);
    if (rowIndex === -1) {
      return;
    }
    const cols = [...this._rows$.value[rowIndex].columns];
    const colIndex = cols.findIndex((c) => c.id === columnId);
    if (colIndex === -1) {
      return;
    }
    cols.splice(colIndex, 1, {
      id: columnId,
      value: cell.value,
      note: cell.note,
    });
    rows[colIndex].columns = cols;
    this._rows$.next(rows);
  }
}

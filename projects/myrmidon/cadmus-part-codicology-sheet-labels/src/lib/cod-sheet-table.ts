import { BehaviorSubject, Observable } from 'rxjs';
import { CodColumn, CodRow } from './cod-sheet-labels-part';
import { CodLabelCell } from './label-generator';

/**
 * Type of table row.
 */
export enum CodRowType {
  EndleafFront = 0,
  Body,
  EndleafBack,
}

/**
 * Data about a page (=row) in a table. A page has a type
 * (endleaf/body), a sheet number, and a recto/verso flag.
 */
export interface CodRowPage {
  type: CodRowType;
  n: number;
  v: boolean;
}

/**
 * The viewmodel of a table's row.
 */
export interface CodRowViewModel extends CodRow, CodRowPage {}

/**
 * The types of table columns: quires, numberings, catchwords,
 * signatures, register signatures.
 */
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
 * or "(/)" (back). Each row has an array of columns, which is kept
 * in synch across all the rows.
 * Columns are sorted first by type: qncsr; and then by their suffix,
 * which optionally follows the type letter plus a dot. So, "q" is the
 * default (and unique) quire column; "n" is the default numbering;
 * "n.roman" is another numbering; etc.
 */
export class CodSheetTable {
  private _cols$: BehaviorSubject<string[]>;
  private _rows$: BehaviorSubject<CodRowViewModel[]>;
  private _colPrefixes: string[];

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
    this._colPrefixes = ['q', 'n', 'c', 's', 'r'];
  }

  /**
   * Gets the current list of column IDs.
   * @returns The list of column IDs.
   */
  public getColumnIds(): string[] {
    return [...this._cols$.value];
  }

  /**
   * Gets the current list of rows.
   * @returns The list of rows.
   */
  public getRows(): CodRowViewModel[] {
    return [...this._rows$.value];
  }

  /**
   * Build the column ID from its type and optional suffix.
   *
   * @param type The column type.
   * @param suffix The optional suffix.
   * @returns The column ID.
   */
  public buildColumnId(type: CodColumnType, suffix?: string): string {
    return suffix ? `${type}.${suffix}` : type;
  }

  /**
   * Add the specified column to the table. The column ID is calculated
   * from its type and suffix, and its position is determined by that ID.
   * If a column with the same ID already exists, nothing is done.
   *
   * @param id The ID of the column to add.
   */
  public addColumn(id: string): void {
    if (this._cols$.value.includes(id)) {
      return;
    }
    // insert the new col at the right place
    const cols = [...this._cols$.value];
    const prefix = this._colPrefixes.indexOf(id.charAt(0));
    let colIndex = cols.length - 1;
    while (colIndex > -1) {
      if (prefix >= this._colPrefixes.indexOf(cols[colIndex].charAt(0))) {
        break;
      }
      colIndex--;
    }
    cols.splice(colIndex + 1, 0, id);

    // insert the new col in each row
    const rows = [...this._rows$.value];
    for (let i = 0; i < rows.length; i++) {
      rows[i].columns.splice(colIndex + 1, 0, {
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
      case CodRowType.EndleafBack:
        return `(/${n}${rv})`;
      default:
        return `${n}${rv}`;
    }
  }

  private getNewColumns(): CodColumn[] {
    const cols: CodColumn[] = new Array(this._cols$.value.length);
    for (let i = 0; i < cols.length; i++) {
      cols[i] = {
        id: this._cols$.value[i],
      };
    }
    return cols;
  }

  /**
   * Append the specified number of rows.
   *
   * @param type The type of the rows to append.
   * @param count The count of rows to be appended.
   */
  public appendRows(type: CodRowType, count: number): void {
    const rows = [...this._rows$.value];
    let n: number, v: boolean;

    // locate last row of same type
    let lastRowIndex = rows.length - 1;
    while (lastRowIndex > -1 && rows[lastRowIndex].type !== type) {
      lastRowIndex--;
    }
    if (lastRowIndex > -1) {
      n = rows[lastRowIndex].n;
      v = rows[lastRowIndex].v;
    } else {
      n = 0;
      v = true;
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
        columns: this.getNewColumns(),
        type: type,
        n: n,
        v: v,
      });
    }

    this._rows$.next(rows);
  }

  /**
   * Update the specified cell in the table. If the cell is not found,
   * nothing is done.
   *
   * @param cell The cell to update.
   */
  public updateCell(cell: CodLabelCell): void {
    const rows = [...this._rows$.value];
    const rowIndex = rows.findIndex((r) => r.id === cell.rowId);
    if (rowIndex === -1) {
      return;
    }
    const cols = [...this._rows$.value[rowIndex].columns];
    const colIndex = cols.findIndex((c) => c.id === cell.id);
    if (colIndex === -1) {
      return;
    }
    cols.splice(colIndex, 1, {
      id: cell.id,
      value: cell.value,
      note: cell.note,
    });
    rows[colIndex].columns = cols;
    this._rows$.next(rows);
  }

  private parseRowId(rowId: string): CodRowPage | null {
    const m = /(\()?(\/)?([0-9]+)([rv])/.exec(rowId);
    if (!m) {
      return null;
    }
    return {
      type: m[2]
        ? CodRowType.EndleafBack
        : m[1]
        ? CodRowType.EndleafFront
        : CodRowType.Body,
      n: +m[3],
      v: m[4] === 'v',
    };
  }

  private countRowsBetween(a: CodRowPage, b: CodRowPage): number {
    const n = b.n - a.n;
    return n <= 0 ? 0 : n - 1 + (b.v ? 1 : 0);
  }

  /**
   * Add the specified cells to the table. All the cells belong to the same
   * column, specified by columnId. If this is not found, it will be added.
   * Also, cells are a range of consecutive sheets, e.g. 3r-5v. All the rows
   * preceding the first row of the range being added are inserted if they
   * are missing.
   *
   * @param cells The cells to add.
   */
  public addCells(cells: CodLabelCell[]): void {
    if (!cells.length) {
      return;
    }
    // extract N and V from 1st cell's row ID
    const firstSheet = this.parseRowId(cells[0].rowId);
    if (!firstSheet) {
      return;
    }

    const columnId = cells[0].id;
    const columnIndex = this._colPrefixes.indexOf(cells[0].id);

    // add the target column if it's missing
    if (!this._cols$.value.includes(columnId)) {
      this.addColumn(columnId);
    }

    // locate last row of same type (if any) and extract its N and V
    const rows = [...this._rows$.value];
    const firstPage = this.parseRowId(cells[0].rowId);
    if (!firstPage) {
      return;
    }
    let lastRowIndex = rows.length - 1;
    while (lastRowIndex > -1 && rows[lastRowIndex].type !== firstPage.type) {
      lastRowIndex--;
    }
    let lastSheet: CodRowPage;
    if (lastRowIndex > -1) {
      lastSheet = rows[lastRowIndex];
    } else {
      lastSheet = {
        type: firstSheet.type,
        n: 0,
        v: true,
      };
    }
    let n = lastSheet.n;
    let v = lastSheet.v;
    let rowIndex = lastRowIndex;

    // interpolate rows between last existing sheet and first sheet to add
    const delta = this.countRowsBetween(lastSheet, firstSheet);
    for (let i = 0; i < delta; i++) {
      // next page (each row is a page)
      if (v) {
        n++;
        v = false;
      } else {
        v = true;
      }
      rows.push({
        id: this.buildRowId(firstSheet.type, n, v),
        columns: this.getNewColumns(),
        type: firstSheet.type,
        n: n,
        v: v,
      });
      rowIndex++;
    }

    // set cells
    for (let i = 0; i < cells.length; i++) {
      // if the row does not exist, append it
      if (rowIndex >= rows.length) {
        const row = {
          id: this.buildRowId(firstPage.type, n, v),
          columns: this.getNewColumns(),
          type: firstPage.type,
          n: n,
          v: v,
        };
        const col = row.columns.find((c) => c.id === columnId);
        col!.value = cells[i].value;
        col!.note = cells[i].note;
        rows.push(row);
      }
      // set cell
      rows[rowIndex].columns[columnIndex].value = cells[i].value;
      rows[rowIndex].columns[columnIndex].note = cells[i].note;

      // next page (each row is a page)
      if (v) {
        n++;
        v = false;
      } else {
        v = true;
      }
      rowIndex++;
    }

    // save
    this._rows$.next(rows);
  }
}

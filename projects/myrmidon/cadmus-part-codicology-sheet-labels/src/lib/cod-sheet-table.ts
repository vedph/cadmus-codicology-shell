import { BehaviorSubject, Observable } from 'rxjs';

import { CodColumn, CodRow } from './cod-sheet-labels-part';
import { CodLabelCell } from './label-generator';

/**
 * Type of table row.
 */
export enum CodRowType {
  CoverFront = 0,
  EndleafFront,
  Body,
  EndleafBack,
  CoverBack,
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
 * Rows are sorted first by type: front conver, front endleaf, body,
 * back endleaf, back cover; and then by their sheet number and
 * recto/verso flag (1r, 1v, 2r, 2v...).
 * Endleaves IDs follow the same pattern, but are wrapped in "()" (front)
 * or "(/)" (back). Each row has an array of columns, which is kept
 * in synch across all the rows.
 * Front/back covers are modeled as a special case of endleaves, where
 * the only meaningful location values are system, r/v and suffix. There
 * is no number, as by definition covers are single. Front cover always
 * comes first; back cover always comes last.
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
   * True to drop overflow rows when adding columns; false to
   * add new rows to fit them.
   */
  public overflowDropping: boolean | undefined;

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
   * then by their number. Type order is front-cover, front-endleaf,
   * body, back-endleaf, back-cover. Each row has an ID built of a
   * number (=0 for covers) and a r/v flag (false for covers).
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
   * Gets the index of the specified column ID.
   * @param id The column ID.
   * @returns The column index or -1 if not found.
   */
  public getColumnIndex(id: string): number {
    return this._cols$.value.findIndex((s) => s === id);
  }

  /**
   * Gets the current list of rows.
   * @returns The list of rows.
   */
  public getRows(): CodRowViewModel[] {
    return [...this._rows$.value];
  }

  /**
   * Set the rows and their columns in this table.
   *
   * @param rows The rows.
   */
  public setRows(rows: CodRow[]): void {
    // set cols collecting them from all the rows
    const cols: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].columns.length; j++) {
        const id = rows[i].columns[j].id;
        if (!cols.includes(id)) {
          this.addColumnId(id, cols);
        }
      }
    }
    this._cols$.next(cols);

    // set rows
    this._rows$.next(
      rows.map((r) => {
        const page = this.parseRowId(r.id);
        const cols = this.getNewColumns();
        for (let i = 0; i < r.columns?.length || 0; i++) {
          const ci = cols.findIndex((c) => c.id === r.columns[i].id);
          cols[ci].value = r.columns[i].value;
          cols[ci].features = r.columns[i].features;
          cols[ci].note = r.columns[i].note;
        }
        return {
          ...page,
          id: r.id,
          columns: cols,
        } as CodRowViewModel;
      }),
    );
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
   * Check whether the table has the specified column.
   *
   * @param id The column ID.
   * @param typeOnly True to check for type only.
   * @returns True if found, otherwise false.
   */
  public hasColumn(id: string, typeOnly = false): boolean {
    const type = id.charAt(0);
    return this._cols$.value.find((c) =>
      typeOnly ? c.charAt(0) === type : c === id,
    )
      ? true
      : false;
  }

  private addColumnId(id: string, cols: string[]): number {
    // insert the new col at the right place
    const prefix = this._colPrefixes.indexOf(id.charAt(0));
    let colIndex = cols.length - 1;
    while (colIndex > -1) {
      if (prefix >= this._colPrefixes.indexOf(cols[colIndex].charAt(0))) {
        break;
      }
      colIndex--;
    }
    cols.splice(colIndex + 1, 0, id);
    return colIndex;
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
    const colIndex = this.addColumnId(id, cols);

    // insert the new col in each row
    const rows = [...this._rows$.value];
    for (let i = 0; i < rows.length; i++) {
      rows[i].columns.splice(colIndex + 1, 0, {
        id: id,
      });
    }

    this._cols$.next(cols);
    this._rows$.next(structuredClone(rows));
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
    this._rows$.next(structuredClone(rows));
  }

  private buildRowId(type: CodRowType, n: number, v: boolean) {
    const rv = v ? 'v' : 'r';
    switch (type) {
      case CodRowType.CoverFront:
        return '[' + rv;
      case CodRowType.CoverBack:
        return '[/' + rv;
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

    // corner case: covers are single
    if (type === CodRowType.CoverFront || type === CodRowType.CoverBack) {
      if (rows.some((r) => r.type === type)) {
        return;
      }
      let index = type === CodRowType.CoverFront ? 0 : rows.length;
      const page: CodRowPage = {
        type: type,
        n: 0,
        v: false,
      };
      for (let i = 0; i < 2; i++) {
        rows.splice(index++, 0, {
          id: this.buildRowId(type, page.n, page.v),
          columns: this.getNewColumns(),
          ...page,
        });
        this.incRowPage(page);
      }
      this._rows$.next(structuredClone(rows));
      return;
    }

    // locate last row of same type
    let lastRowIndex = rows.length - 1;
    while (lastRowIndex > -1 && rows[lastRowIndex].type !== type) {
      lastRowIndex--;
    }
    let page: CodRowPage;
    if (lastRowIndex > -1) {
      page = {
        type: type,
        n: rows[lastRowIndex].n,
        v: rows[lastRowIndex].v,
      };
    } else {
      page = {
        type: type,
        n: 0,
        v: true,
      };
      if (rows.length) {
        while (
          lastRowIndex < rows.length - 1 &&
          type > rows[lastRowIndex + 1].type
        ) {
          lastRowIndex++;
        }
      }
    }

    for (let i = 0; i < count; i++) {
      // next page (each row is a page)
      this.incRowPage(page);
      rows.splice(++lastRowIndex, 0, {
        id: this.buildRowId(type, page.n, page.v),
        columns: this.getNewColumns(),
        ...page,
      });
    }

    this._rows$.next(structuredClone(rows));
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
      features: cell.features,
      note: cell.note,
    });
    rows[rowIndex].columns = cols;
    this._rows$.next(structuredClone(rows));
  }

  private parseRowId(rowId: string): CodRowPage | null {
    const m = /([[\(])?(\/)?([0-9]+)([rv])/.exec(rowId);
    if (!m) {
      return null;
    }
    // type:
    let type: CodRowType;
    // is there ( or [?
    if (m[1]) {
      if (m[1] === '(') {
        // (/ or (
        type = m[2] ? CodRowType.EndleafBack : CodRowType.EndleafFront;
      } else {
        // [/ or [
        type = m[2] ? CodRowType.CoverBack : CodRowType.CoverFront;
      }
    } else {
      type = CodRowType.Body;
    }
    return {
      type: type,
      n: +m[3],
      v: m[4] === 'v',
    };
  }

  private getPagePosition(page: CodRowPage): number {
    // 1r=2, 1v=3, 2r=4...
    return page.n * 2 + (page.v ? 1 : 0);
  }

  private countRowsBetween(a: CodRowPage, b: CodRowPage): number {
    // we assume that a/b belong to the same type
    const n = this.getPagePosition(b) - this.getPagePosition(a) - 1;
    return n < 0 ? 0 : n;
  }

  private adjustForTargetColumn(cell: CodLabelCell): number {
    // add the target column if it's missing
    if (!this._cols$.value.includes(cell.id)) {
      this.addColumn(cell.id);
    }
    return this._cols$.value.findIndex((id) => id === cell.id);
  }

  private incRowPage(page: CodRowPage): void {
    // only r/v for covers
    if (
      page.type === CodRowType.CoverFront ||
      page.type === CodRowType.CoverBack
    ) {
      if (!page.v) {
        page.v = true;
      }
      return;
    }

    if (page.v) {
      page.n++;
      page.v = false;
    } else {
      page.v = true;
    }
  }

  /**
   * Locate the row with the specified ID in rows, optionally inserting it
   * when missing. When inserting the target row or interpolating, rows are
   * placed after the last row of the same type preceding the target (or after
   * the rows of the preceding types), and all the missing rows between that
   * row and the target are interpolated.
   *
   * @param rows The rows to work on. This is modified in place.
   * @param rowId The target row ID.
   * @param interpolate True to insert the missing rows preceding the target.
   * @param insertTarget True to insert the target row if missing.
   * @returns The index of the target row, or -1 if not present.
   */
  private ensureRow(
    rows: CodRowViewModel[],
    rowId: string,
    interpolate: boolean,
    insertTarget: boolean,
  ): number {
    // if the target row is already present, just ret its index
    const index = rows.findIndex((r) => r.id === rowId);
    if (index > -1 || (!interpolate && !insertTarget)) {
      return index;
    }

    const b = this.parseRowId(rowId);
    if (!b) {
      return -1;
    }

    // locate the last row preceding the target: this is either a row of
    // the same type coming before the target, or a row of a preceding type
    let i = rows.length - 1;
    while (
      i > -1 &&
      (rows[i].type > b.type ||
        (rows[i].type === b.type &&
          this.getPagePosition(rows[i]) > this.getPagePosition(b)))
    ) {
      i--;
    }

    // the A-term for interpolation is the preceding row of the same type,
    // or 0 if there is none
    const a: CodRowPage =
      i > -1 && rows[i].type === b.type
        ? { type: b.type, n: rows[i].n, v: rows[i].v }
        : { type: b.type, n: 0, v: true };

    // interpolate rows between a and b if any
    let insertIndex = i + 1;
    if (interpolate) {
      const delta = this.countRowsBetween(a, b);
      const interp: CodRowPage = { ...a };
      for (let j = 0; j < delta; j++) {
        // next page (each row is a page)
        this.incRowPage(interp);
        rows.splice(insertIndex++, 0, {
          id: this.buildRowId(interp.type, interp.n, interp.v),
          columns: this.getNewColumns(),
          ...interp,
        });
      }
    }

    if (!insertTarget) {
      return -1;
    }
    rows.splice(insertIndex, 0, {
      id: rowId,
      columns: this.getNewColumns(),
      ...b,
    });
    return insertIndex;
  }

  /**
   * Add the specified cells to the table. All the cells belong to the same
   * column, specified by the ID of the first cell. If this is not found, it
   * will be added. Each cell is placed in the row matching its row ID.
   * The rows preceding the first cell's row are inserted if they are missing.
   * The rows of the other cells are inserted when missing only when appending
   * is enabled; otherwise, their cells are dropped.
   *
   * @param cells The cells to add.
   * @param appendMissing True to insert all the missing rows targeted by
   * cells; false to drop cells targeting missing rows. When not specified,
   * this is the opposite of overflowDropping.
   */
  public addCells(cells: CodLabelCell[], appendMissing?: boolean): void {
    if (!cells.length) {
      return;
    }
    const append = appendMissing ?? !this.overflowDropping;

    // adjust and locate target column
    const columnIndex = this.adjustForTargetColumn(cells[0]);

    const rows = structuredClone(this._rows$.value);
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      // rows preceding the first cell are always interpolated
      const rowIndex = this.ensureRow(
        rows,
        cell.rowId,
        i === 0 || append,
        append,
      );
      if (rowIndex === -1) {
        continue;
      }
      const col = rows[rowIndex].columns[columnIndex];
      col.value = cell.value;
      col.features = cell.features;
      col.note = cell.note;
    }

    // save
    this._rows$.next(rows);
  }

  private isRowEmpty(row: CodRowViewModel): boolean {
    return row.columns.length
      ? row.columns.every((c) => !c.value && !c.note)
      : false;
  }

  private isColumnEmpty(index: number): boolean {
    const rows = this._rows$.value;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].columns[index].value || rows[i].columns[index].note) {
        return false;
      }
    }
    return true;
  }

  /**
   * Trim the table by removing all the empty rows at its start/end,
   * and optionally all the empty columns.
   */
  public trim(columns = false): void {
    // trim rows
    const rows = [...this._rows$.value];
    // tail
    let i = rows.length - 1;
    while (i > -1 && this.isRowEmpty(rows[i])) {
      i--;
    }
    if (i === -1) {
      rows.length = 0;
    } else {
      // head
      const bottom = i;
      i = 0;
      while (i < bottom && this.isRowEmpty(rows[i])) {
        i++;
      }
      rows.splice(bottom + 1, rows.length - (bottom + 1));
      rows.splice(0, i);
    }

    // clear if no more rows
    if (!rows.length) {
      this._rows$.next([]);
      if (columns) {
        this._cols$.next([]);
      }
      return;
    }

    // trim columns if requested
    if (columns) {
      const cols = [...this._cols$.value];
      i = rows[0].columns.length - 1;
      while (i > -1) {
        if (this.isColumnEmpty(i)) {
          cols.splice(i, 1);
          for (let j = 0; j < rows.length; j++) {
            rows[j].columns.splice(i, 1);
          }
        }
        i--;
      }
      this._cols$.next(cols);
    }

    // update rows
    this._rows$.next(structuredClone(rows));
  }

  /**
   * Set the value of all the matching pages in the specified column.
   * If a target page does not exist, the requested value set will not happen.
   * @param columnIndex The target column index.
   * @param pages The target pages.
   * @param value The value to set.
   */
  public setPageValue(
    columnIndex: number,
    pages: CodRowPage[],
    value: string | undefined | null,
  ): void {
    const rows = structuredClone([...this._rows$.value]) as CodRowViewModel[];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const id = this.parseRowId(row.id);
      const page = pages.find(
        (p) => p.type === id?.type && p.n === id.n && p.v === id.v,
      );
      if (page) {
        row.columns[columnIndex].value = value || undefined;
      }
    }
    this._rows$.next(rows);
  }

  /**
   * Set values of existing rows by matching their row IDs.
   * Unlike addCells, this never creates new rows; rows that do not exist
   * in the table are simply ignored.
   * @param cells The cells to apply.
   */
  public setCells(cells: CodLabelCell[]): void {
    if (!cells.length) {
      return;
    }
    const columnId = cells[0].id;
    const columnIndex = this._cols$.value.findIndex((id) => id === columnId);
    if (columnIndex < 0) {
      return;
    }
    const rows = structuredClone([...this._rows$.value]) as CodRowViewModel[];
    for (const cell of cells) {
      const row = rows.find((r) => r.id === cell.rowId);
      if (row) {
        row.columns[columnIndex].value = cell.value || undefined;
      }
    }
    this._rows$.next(rows);
  }

  /**
   * Clear values of all cells in the specified column.
   * @param columnId The ID of the column to clear values from.
   */
  public clearColumnValues(columnId: string): void {
    const rows = structuredClone([...this._rows$.value]) as CodRowViewModel[];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const columnIndex = this._cols$.value.findIndex((id) => id === columnId);
      if (columnIndex >= 0 && row.columns[columnIndex]) {
        row.columns[columnIndex].value = undefined;
      }
    }
    this._rows$.next(rows);
  }

  /**
   * Get the maximum quire number in the table.
   * @returns The maximum quire number.
   */
  public getMaxQuireNumber(): number {
    const rows = this._rows$.value;
    let max = 0;
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].columns.length; j++) {
        const col = rows[i].columns[j];
        if (col.id === 'q' && col.value) {
          // q value is like 1.1/4, 1.2/4, etc.
          const n = parseInt(
            col.value.substring(0, col.value.indexOf('.')),
            10,
          );
          if (n > max) {
            max = n;
          }
        }
      }
    }
    return max;
  }
}

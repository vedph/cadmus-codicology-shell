import { Pipe, PipeTransform } from '@angular/core';

import { CodColumn } from '../cod-sheet-labels-part';

/**
 * This pipe is used to adapt a bound column into a cell
 * by just adding it the rowId property got from the
 * pipe's first argument.
 */
@Pipe({
  name: 'cellAdapter',
  standalone: false,
})
export class CellAdapterPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if (!value) {
      return null;
    }
    const rowId = args[0];
    const col = value as CodColumn;
    return { ...col, rowId: rowId };
  }
}

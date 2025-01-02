import { BehaviorSubject, Observable } from 'rxjs';

import { CodRow } from './cod-sheet-labels-part';

interface LabelEntry {
  location: string;
  label: string;
}

export class CodLocationConverter {
  private _entries: { [key: string]: LabelEntry[] };
  private _systems$: BehaviorSubject<string[]>;

  /**
   * The available numeric systems.
   */
  public get systems$(): Observable<string[]> {
    return this._systems$.asObservable();
  }

  constructor() {
    this._entries = {};
    this._systems$ = new BehaviorSubject<string[]>([]);
  }

  public setRows(rows: CodRow[]): void {
    this._entries = {};

    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.columns.length; x++) {
        const col = row.columns[x];
        if (!col.id.startsWith('n.') && col.id !== 'n') {
          continue;
        }
        if (!this._entries[col.id]) {
          this._entries[col.id] = [];
        }
        if (col.value) {
          this._entries[col.id].push({
            location: row.id,
            label: col.value,
          });
        }
      }
    }
    const systems: string[] = Object.getOwnPropertyNames(this._entries);
    systems.sort();
    this._systems$.next(systems);
  }

  public getLocation(system: string, label: string): string | null {
    if (!this._entries[system]) {
      return null;
    }
    return (
      this._entries[system].find((e) => e.label === label)?.location || null
    );
  }

  public getLabel(system: string, location: string): string | null {
    if (!this._entries[system]) {
      return null;
    }
    return (
      this._entries[system].find((e) => e.location === location)?.label || null
    );
  }
}

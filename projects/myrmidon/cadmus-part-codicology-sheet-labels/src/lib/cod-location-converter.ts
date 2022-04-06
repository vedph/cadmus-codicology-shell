import { CodRow } from './cod-sheet-labels-part';

interface LabelEntry {
  location: string;
  label: string;
}

export class CodLocationConverter {
  private _entries: { [key: string]: LabelEntry[] };

  constructor() {
    this._entries = {};
  }

  public setRows(rows: CodRow[]): void {
    this._entries = {};
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.columns.length; x++) {
        const col = row.columns[x];
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

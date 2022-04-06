import { CodRowType, CodSheetTable } from './cod-sheet-table';

describe('CodSheetTable', () => {
  it('addColumn should add a new column', () => {
    const table = new CodSheetTable();
    table.addColumn('q');

    const ids = table.getColumnIds();
    expect(ids.length).toBe(1);
    expect(ids[0]).toBe('q');
  });

  it('addColumn should not add an existing column', () => {
    const table = new CodSheetTable();
    table.addColumn('q');
    table.addColumn('q');

    const ids = table.getColumnIds();
    expect(ids.length).toBe(1);
    expect(ids[0]).toBe('q');
  });

  it('addColumn should add a not existing column', () => {
    const table = new CodSheetTable();
    table.addColumn('q');
    table.addColumn('n');

    const ids = table.getColumnIds();
    expect(ids.length).toBe(2);
    expect(ids[0]).toBe('q');
    expect(ids[1]).toBe('n');
  });

  it('appendRows should append body rows (empty)', () => {
    const table = new CodSheetTable();
    table.addColumn('q');
    table.addColumn('n');
    table.appendRows(CodRowType.Body, 2);

    const rows = table.getRows();
    expect(rows.length).toBe(2);

    for (let i = 0; i < 2; i++) {
      const row = rows[i];
      expect(row.id).toBe(i === 0 ? '1r' : '1v');
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[1].id).toBe('n');
    }
  });

  it('appendRows should append body rows (not empty)', () => {
    const table = new CodSheetTable();
    table.addColumn('q');
    table.addColumn('n');
    // 1r
    table.appendRows(CodRowType.Body, 1);
    // 1v 2r
    table.appendRows(CodRowType.Body, 2);

    const rows = table.getRows();
    expect(rows.length).toBe(3);

    const expIds = ['1r', '1v', '2r'];
    for (let i = 0; i < 2; i++) {
      const row = rows[i];
      expect(row.id).toBe(expIds[i]);
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[1].id).toBe('n');
    }
  });

  it('appendRows should append front endleaf rows (empty)', () => {
    const table = new CodSheetTable();
    table.addColumn('q');
    table.addColumn('n');
    table.appendRows(CodRowType.EndleafFront, 2);

    const rows = table.getRows();
    expect(rows.length).toBe(2);

    for (let i = 0; i < 2; i++) {
      const row = rows[i];
      expect(row.id).toBe(i === 0 ? '(1r)' : '(1v)');
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[1].id).toBe('n');
    }
  });

  it('appendRows should append front endleaf rows', () => {
    const table = new CodSheetTable();
    table.addColumn('q');
    table.addColumn('n');
    table.appendRows(CodRowType.Body, 1);
    table.appendRows(CodRowType.EndleafFront, 2);

    const rows = table.getRows();
    expect(rows.length).toBe(3);

    const colIds = ['(1r)', '(1v)', '1r'];
    for (let i = 0; i < 3; i++) {
      const row = rows[i];
      expect(row.id).toBe(colIds[i]);
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[1].id).toBe('n');
    }
  });

  it('appendRows should append back endleaf rows (empty)', () => {
    const table = new CodSheetTable();
    table.addColumn('q');
    table.addColumn('n');
    table.appendRows(CodRowType.EndleafBack, 2);

    const rows = table.getRows();
    expect(rows.length).toBe(2);

    for (let i = 0; i < 2; i++) {
      const row = rows[i];
      expect(row.id).toBe(i === 0 ? '(/1r)' : '(/1v)');
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[1].id).toBe('n');
    }
  });

  it('appendRows should append back endleaf rows', () => {
    const table = new CodSheetTable();
    table.addColumn('q');
    table.addColumn('n');
    table.appendRows(CodRowType.Body, 1);
    table.appendRows(CodRowType.EndleafBack, 2);

    const rows = table.getRows();
    expect(rows.length).toBe(3);

    const colIds = ['1r', '(/1r)', '(/1v)'];
    for (let i = 0; i < 3; i++) {
      const row = rows[i];
      expect(row.id).toBe(colIds[i]);
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[1].id).toBe('n');
    }
  });

  it('updateCell should do nothing when not found', () => {
    const table = new CodSheetTable();
    table.addColumn('q');
    table.addColumn('n');
    // 1r 1v
    table.appendRows(CodRowType.Body, 2);

    table.updateCell({
      rowId: '10v',
      id: 'n',
      value: 'III',
      note: 'a note',
    });

    const rows = table.getRows();
    expect(rows.length).toBe(2);

    const expIds = ['1r', '1v'];
    for (let i = 0; i < 2; i++) {
      const row = rows[i];
      expect(row.id).toBe(expIds[i]);
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[0].value).toBeFalsy();
      expect(row.columns[0].note).toBeFalsy();
      expect(row.columns[1].id).toBe('n');
      expect(row.columns[1].value).toBeFalsy();
      expect(row.columns[1].note).toBeFalsy();
    }
  });

  it('updateCell should update when found', () => {
    const table = new CodSheetTable();
    table.addColumn('q');
    table.addColumn('n');
    // 1r 1v
    table.appendRows(CodRowType.Body, 2);

    table.updateCell({
      rowId: '1v',
      id: 'n',
      value: 'III',
      note: 'a note',
    });

    const rows = table.getRows();
    expect(rows.length).toBe(2);

    const expIds = ['1r', '1v'];
    for (let i = 0; i < 2; i++) {
      const row = rows[i];
      expect(row.id).toBe(expIds[i]);
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[0].value).toBeFalsy();
      expect(row.columns[0].note).toBeFalsy();
      expect(row.columns[1].id).toBe('n');
      if (i === 1) {
        expect(row.columns[1].value).toBe('III');
        expect(row.columns[1].note).toBe('a note');
      } else {
        expect(row.columns[1].value).toBeFalsy();
        expect(row.columns[1].note).toBeFalsy();
      }
    }
  });

  it('addCells should update existing cells', () => {
    const table = new CodSheetTable();
    // 1r 1v X q n
    table.addColumn('q');
    table.addColumn('n');
    table.appendRows(CodRowType.Body, 2);

    table.addCells([
      {
        rowId: '1v',
        id: 'n',
        value: 'x',
        note: 'note',
      },
    ]);

    const rows = table.getRows();
    expect(rows.length).toBe(2);

    const expIds = ['1r', '1v'];
    for (let i = 0; i < 2; i++) {
      const row = rows[i];
      expect(row.id).toBe(expIds[i]);
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[0].value).toBeFalsy();
      expect(row.columns[0].note).toBeFalsy();
      expect(row.columns[1].id).toBe('n');
      if (i === 1) {
        expect(row.columns[1].value).toBe('x');
        expect(row.columns[1].note).toBe('note');
      } else {
        expect(row.columns[1].value).toBeFalsy();
        expect(row.columns[1].note).toBeFalsy();
      }
    }
  });

  it('addCells should append not existing rows', () => {
    const table = new CodSheetTable();
    // 1r 1v X q n
    table.addColumn('q');
    table.addColumn('n');
    table.appendRows(CodRowType.Body, 2);

    table.addCells([
      {
        rowId: '1v',
        id: 'n',
        value: 'x',
        note: 'note',
      },
      {
        rowId: '2r',
        id: 'n',
        value: 'y',
        note: 'end',
      },
    ]);

    const rows = table.getRows();
    expect(rows.length).toBe(3);

    const expIds = ['1r', '1v', '2r'];
    for (let i = 0; i < 3; i++) {
      const row = rows[i];
      expect(row.id).toBe(expIds[i]);
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[0].value).toBeFalsy();
      expect(row.columns[0].note).toBeFalsy();

      expect(row.columns[1].id).toBe('n');
      switch (i) {
        case 1:
          expect(row.columns[1].value).toBe('x');
          expect(row.columns[1].note).toBe('note');
          break;
        case 2:
          expect(row.columns[1].value).toBe('y');
          expect(row.columns[1].note).toBe('end');
          break;
        default:
          expect(row.columns[1].value).toBeFalsy();
          expect(row.columns[1].note).toBeFalsy();
          break;
      }
    }
  });

  it('addCells should interpolate and append not existing rows', () => {
    const table = new CodSheetTable();
    // 1r 1v X q n
    table.addColumn('q');
    table.addColumn('n');
    table.appendRows(CodRowType.Body, 2);

    table.addCells([
      {
        rowId: '2v',
        id: 'n',
        value: 'x',
        note: 'note',
      },
    ]);

    const rows = table.getRows();
    expect(rows.length).toBe(4);

    const expIds = ['1r', '1v', '2r', '2v'];
    for (let i = 0; i < 4; i++) {
      const row = rows[i];
      expect(row.id).toBe(expIds[i]);
      expect(row.columns.length).toBe(2);
      expect(row.columns[0].id).toBe('q');
      expect(row.columns[0].value).toBeFalsy();
      expect(row.columns[0].note).toBeFalsy();

      expect(row.columns[1].id).toBe('n');
      if (i === 3) {
        expect(row.columns[1].value).toBe('x');
        expect(row.columns[1].note).toBe('note');
      } else {
        expect(row.columns[1].value).toBeFalsy();
        expect(row.columns[1].note).toBeFalsy();
      }
    }
  });
});

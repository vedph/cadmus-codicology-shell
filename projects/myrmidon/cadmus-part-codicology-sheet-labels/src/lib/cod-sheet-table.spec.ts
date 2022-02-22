import { CodRowType, CodSheetTable } from './cod-sheet-table';

fdescribe('CodSheetTable', () => {
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
});

import { CellAdapterPipe } from './cell-adapter.pipe';

describe('CellAdapterPipe', () => {
  const pipe = new CellAdapterPipe();

  it('should return null for no value', () => {
    expect(pipe.transform(null, 'r1')).toBeNull();
    expect(pipe.transform(undefined, 'r1')).toBeNull();
  });

  it('should add the row ID to the column', () => {
    const col = { id: 'n_1', value: '12' };

    const cell = pipe.transform(col, 'r3');

    expect(cell).toEqual({ id: 'n_1', value: '12', rowId: 'r3' });
    // the source column is not changed
    expect(col).toEqual({ id: 'n_1', value: '12' });
  });
});

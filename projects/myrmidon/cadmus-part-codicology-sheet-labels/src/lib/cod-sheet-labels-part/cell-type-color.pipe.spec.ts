import { CellTypeColorPipe } from './cell-type-color.pipe';

describe('CellTypeColorPipe', () => {
  const pipe = new CellTypeColorPipe();

  it('should return null for no value', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform('')).toBeNull();
  });

  it.each([
    ['q_1', '#f5decb'],
    ['n_1', '#d5e6e6'],
    ['c_1', '#d1e6d1'],
    ['s_1', '#f5dfdf'],
    ['r_1', '#ddc3fa'],
  ])('should map column %s to %s', (id, color) => {
    expect(pipe.transform(id)).toBe(color);
  });

  it('should return null for unknown column types', () => {
    expect(pipe.transform('x_1')).toBeNull();
  });
});

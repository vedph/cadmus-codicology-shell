import { CodLocationConverter } from './cod-location-converter';
import { CodRow } from './cod-sheet-labels-part';

describe('CodLocationConverterService', () => {
  const rows: CodRow[] = [
    {
      id: '1r',
      columns: [
        {
          id: 'n.alpha',
          value: 'i',
        },
        {
          id: 'n.beta',
          value: '10',
        },
      ],
    },
    {
      id: '1v',
      columns: [
        {
          id: 'n.alpha',
          value: 'ii',
        },
        {
          id: 'n.beta',
          value: '20',
        },
      ],
    },
    {
      id: '2r',
      columns: [
        {
          id: 'n.alpha',
          value: 'iii',
        },
        {
          id: 'n.gamma',
          value: '300',
        },
      ],
    },
  ];

  // label from location
  it('get label not existing system rets null', () => {
    const converter = new CodLocationConverter();
    converter.setRows(rows);
    expect(converter.getLabel('x', '1r')).toBeNull();
  });

  it('get not existing label rets null', () => {
    const converter = new CodLocationConverter();
    converter.setRows(rows);
    expect(converter.getLabel('n.alpha', 'x')).toBeNull();
  });

  it('get existing label rets location', () => {
    const converter = new CodLocationConverter();
    converter.setRows(rows);
    expect(converter.getLabel('n.alpha', '1v')).toBe('ii');
    expect(converter.getLabel('n.beta', '1r')).toBe('10');
  });

  // location from label
  it('get location not existing system rets null', () => {
    const converter = new CodLocationConverter();
    converter.setRows(rows);
    expect(converter.getLocation('x', 'ii')).toBeNull();
  });

  it('get not existing location rets null', () => {
    const converter = new CodLocationConverter();
    converter.setRows(rows);
    expect(converter.getLocation('n.alpha', 'x')).toBeNull();
  });

  it('get existing location rets label', () => {
    const converter = new CodLocationConverter();
    converter.setRows(rows);
    expect(converter.getLocation('n.alpha', 'ii')).toBe('1v');
    expect(converter.getLocation('n.beta', '10')).toBe('1r');
  });
});

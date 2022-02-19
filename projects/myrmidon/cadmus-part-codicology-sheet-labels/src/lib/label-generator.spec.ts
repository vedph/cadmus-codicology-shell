import { CodLabelActionType, LabelGenerator } from './label-generator';

describe('LabelGenerator', () => {
  // parser
  it('should parse null as null', () => {
    const action = LabelGenerator.parseAction(null);
    expect(action).toBeNull();
  });
  it('should parse undefined as null', () => {
    const action = LabelGenerator.parseAction(undefined);
    expect(action).toBeNull();
  });
  it('should parse empty as null', () => {
    const action = LabelGenerator.parseAction('');
    expect(action).toBeNull();
  });
  it('should parse "1x2" as null', () => {
    const action = LabelGenerator.parseAction('1x2');
    expect(action).toBeNull();
  });
  it('should parse "1x2="', () => {
    const action = LabelGenerator.parseAction('1x2=');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBeFalsy();
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1x2=custom"', () => {
    const action = LabelGenerator.parseAction('1x2=custom');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1rx2=custom"', () => {
    const action = LabelGenerator.parseAction('1rx2=custom');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1vx2=custom"', () => {
    const action = LabelGenerator.parseAction('1vx2=custom');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeTrue();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1r*2=custom"', () => {
    const action = LabelGenerator.parseAction('1r*2=custom');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1r%2=custom"', () => {
    const action = LabelGenerator.parseAction('1r%2=custom');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeTrue();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1r x 2 = custom"', () => {
    const action = LabelGenerator.parseAction('1r x 2 = custom');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1x2=12"', () => {
    const action = LabelGenerator.parseAction('1x2=12');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('12');
    expect(action!.type).toBe(CodLabelActionType.Arabic);
  });
  it('should parse "1x2=II"', () => {
    const action = LabelGenerator.parseAction('1x2=II');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('II');
    expect(action!.type).toBe(CodLabelActionType.UpperRoman);
  });
  it('should parse "1x2=X"', () => {
    const action = LabelGenerator.parseAction('1x2=X');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('X');
    expect(action!.type).toBe(CodLabelActionType.UpperRoman);
  });
  it('should parse "1x2="X" as custom"', () => {
    const action = LabelGenerator.parseAction('1x2="X"');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('X');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1x2=ii"', () => {
    const action = LabelGenerator.parseAction('1x2=ii');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('ii');
    expect(action!.type).toBe(CodLabelActionType.LowerRoman);
  });
  it('should parse "1x2=b"', () => {
    const action = LabelGenerator.parseAction('1x2=b');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('b');
    expect(action!.type).toBe(CodLabelActionType.LatLowerLetter);
  });
  it('should parse "1x2=B"', () => {
    const action = LabelGenerator.parseAction('1x2=B');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('B');
    expect(action!.type).toBe(CodLabelActionType.LatUpperLetter);
  });
  it('should parse "1x2=Β"', () => {
    const action = LabelGenerator.parseAction('1x2=Β');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('Β');
    expect(action!.type).toBe(CodLabelActionType.GrcUpperLetter);
  });
  it('should parse "1x2=β"', () => {
    const action = LabelGenerator.parseAction('1x2=β');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('β');
    expect(action!.type).toBe(CodLabelActionType.GrcLowerLetter);
  });
  it('should parse "1x2=q1/4"', () => {
    const action = LabelGenerator.parseAction('1x2=q1/4');
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('q1/4');
    expect(action!.type).toBe(CodLabelActionType.Quire);
  });

  // generator
  it('should generate 3 from 1rx3=1', () => {
    const cells = LabelGenerator.generateFrom('1x3=1');
    expect(cells).toBeTruthy();
    expect(cells.length).toBe(3);
    for (let i = 0; i < 3; i++) {
      expect(cells[i].rowId).toBe(`${i + 1}r`);
      expect(cells[i].value).toBe(`${i + 1}`);
    }
  });
  it('should generate 3 from 1r%3=1', () => {
    const cells = LabelGenerator.generateFrom('1%3=1');
    expect(cells).toBeTruthy();
    expect(cells.length).toBe(3);

    let cell = cells[0];
    expect(cell.rowId).toBe('1r');
    expect(cell.value).toBe('1');

    cell = cells[1];
    expect(cell.rowId).toBe('1v');
    expect(cell.value).toBe('2');

    cell = cells[2];
    expect(cell.rowId).toBe('2r');
    expect(cell.value).toBe('3');
  });
  it('should generate 3 from 1vx3=X', () => {
    const cells = LabelGenerator.generateFrom('1vx3=X');
    expect(cells).toBeTruthy();
    expect(cells.length).toBe(3);

    let cell = cells[0];
    expect(cell.rowId).toBe('1v');
    expect(cell.value).toBe('X');

    cell = cells[1];
    expect(cell.rowId).toBe('2v');
    expect(cell.value).toBe('XI');

    cell = cells[2];
    expect(cell.rowId).toBe('3v');
    expect(cell.value).toBe('XII');
  });
  it('should generate 16 from 1x2=q1/4', () => {
    const cells = LabelGenerator.generateFrom('1x2=q1/4');
    expect(cells).toBeTruthy();
    expect(cells.length).toBe(16);

    // 1st quire
    let cell = cells[0];
    expect(cell.rowId).toBe('1r');
    expect(cell.value).toBe('1.1/4');
    cell = cells[1];
    expect(cell.rowId).toBe('1v');
    expect(cell.value).toBe('1.1/4');

    cell = cells[2];
    expect(cell.rowId).toBe('2r');
    expect(cell.value).toBe('1.2/4');
    cell = cells[3];
    expect(cell.rowId).toBe('2v');
    expect(cell.value).toBe('1.2/4');

    cell = cells[4];
    expect(cell.rowId).toBe('3r');
    expect(cell.value).toBe('1.3/4');
    cell = cells[5];
    expect(cell.rowId).toBe('3v');
    expect(cell.value).toBe('1.3/4');

    cell = cells[6];
    expect(cell.rowId).toBe('4r');
    expect(cell.value).toBe('1.4/4');
    cell = cells[7];
    expect(cell.rowId).toBe('4v');
    expect(cell.value).toBe('1.4/4');

    // 2nd quire
    cell = cells[8];
    expect(cell.rowId).toBe('5r');
    expect(cell.value).toBe('2.1/4');
    cell = cells[9];
    expect(cell.rowId).toBe('5v');
    expect(cell.value).toBe('2.1/4');

    cell = cells[10];
    expect(cell.rowId).toBe('6r');
    expect(cell.value).toBe('2.2/4');
    cell = cells[11];
    expect(cell.rowId).toBe('6v');
    expect(cell.value).toBe('2.2/4');

    cell = cells[12];
    expect(cell.rowId).toBe('7r');
    expect(cell.value).toBe('2.3/4');
    cell = cells[13];
    expect(cell.rowId).toBe('7v');
    expect(cell.value).toBe('2.3/4');

    cell = cells[14];
    expect(cell.rowId).toBe('8r');
    expect(cell.value).toBe('2.4/4');
    cell = cells[15];
    expect(cell.rowId).toBe('8v');
    expect(cell.value).toBe('2.4/4');
  });
});

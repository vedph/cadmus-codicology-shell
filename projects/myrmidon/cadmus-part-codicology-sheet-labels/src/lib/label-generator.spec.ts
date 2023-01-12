import { CodRowType } from './cod-sheet-table';
import {
  CodLabelAction,
  CodLabelActionType,
  CodLabelSetAction,
  LabelGenerator,
} from './label-generator';

fdescribe('LabelGenerator', () => {
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
    const action = LabelGenerator.parseAction('1x2=') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBeFalsy();
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1x2=custom"', () => {
    const action = LabelGenerator.parseAction('1x2=custom') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1rx2=custom"', () => {
    const action = LabelGenerator.parseAction('1rx2=custom') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1vx2=custom"', () => {
    const action = LabelGenerator.parseAction('1vx2=custom') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeTrue();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1r*2=custom"', () => {
    const action = LabelGenerator.parseAction('1r*2=custom') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1r%2=custom"', () => {
    const action = LabelGenerator.parseAction('1r%2=custom') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeTrue();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1r x 2 = custom"', () => {
    const action = LabelGenerator.parseAction(
      '1r x 2 = custom'
    ) as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1x2=12"', () => {
    const action = LabelGenerator.parseAction('1x2=12') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('12');
    expect(action!.type).toBe(CodLabelActionType.Arabic);
  });
  it('should parse "1x2=II"', () => {
    const action = LabelGenerator.parseAction('1x2=II') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('II');
    expect(action!.type).toBe(CodLabelActionType.UpperRoman);
  });
  it('should parse "1x2=X"', () => {
    const action = LabelGenerator.parseAction('1x2=X') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('X');
    expect(action!.type).toBe(CodLabelActionType.UpperRoman);
  });
  it('should parse "1x2="X" as custom"', () => {
    const action = LabelGenerator.parseAction('1x2="X"') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('X');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1x2=ii"', () => {
    const action = LabelGenerator.parseAction('1x2=ii') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('ii');
    expect(action!.type).toBe(CodLabelActionType.LowerRoman);
  });
  it('should parse "1x2=b"', () => {
    const action = LabelGenerator.parseAction('1x2=b') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('b');
    expect(action!.type).toBe(CodLabelActionType.LatLowerLetter);
  });
  it('should parse "1x2=B"', () => {
    const action = LabelGenerator.parseAction('1x2=B') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('B');
    expect(action!.type).toBe(CodLabelActionType.LatUpperLetter);
  });
  it('should parse "1x2=Β"', () => {
    const action = LabelGenerator.parseAction('1x2=Β') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('Β');
    expect(action!.type).toBe(CodLabelActionType.GrcUpperLetter);
  });
  it('should parse "1x2=β"', () => {
    const action = LabelGenerator.parseAction('1x2=β') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('β');
    expect(action!.type).toBe(CodLabelActionType.GrcLowerLetter);
  });
  it('should parse "1x2=q1/4"', () => {
    const action = LabelGenerator.parseAction('1x2=q1/4') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('q1/4');
    expect(action!.type).toBe(CodLabelActionType.Quire);
  });

  // generator
  it('should generate 6 from 1rx3=10', () => {
    const cells = LabelGenerator.generateFrom('n', '1rx3=10');
    expect(cells).toBeTruthy();
    expect(cells.length).toBe(6);

    let cell = cells[0];
    expect(cell.rowId).toBe('1r');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('10r');

    cell = cells[1];
    expect(cell.rowId).toBe('1v');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('10v');

    cell = cells[2];
    expect(cell.rowId).toBe('2r');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('11r');

    cell = cells[3];
    expect(cell.rowId).toBe('2v');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('11v');

    cell = cells[4];
    expect(cell.rowId).toBe('3r');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('12r');

    cell = cells[5];
    expect(cell.rowId).toBe('3v');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('12v');
  });

  it('should generate 3 from 1r%3=1', () => {
    const cells = LabelGenerator.generateFrom('n', '1%3=1');
    expect(cells).toBeTruthy();
    expect(cells.length).toBe(3);

    let cell = cells[0];
    expect(cell.rowId).toBe('1r');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('1');

    cell = cells[1];
    expect(cell.rowId).toBe('1v');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('2');

    cell = cells[2];
    expect(cell.rowId).toBe('2r');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('3');
  });

  it('should generate 4 from 1vx2=X', () => {
    const cells = LabelGenerator.generateFrom('n', '1vx2=X');
    expect(cells).toBeTruthy();
    expect(cells.length).toBe(4);

    let cell = cells[0];
    expect(cell.rowId).toBe('1v');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('Xv');

    cell = cells[1];
    expect(cell.rowId).toBe('2r');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('XIr');

    cell = cells[2];
    expect(cell.rowId).toBe('2v');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('XIv');

    cell = cells[3];
    expect(cell.rowId).toBe('3r');
    expect(cell.id).toBe('n');
    expect(cell.value).toBe('XIIr');
  });

  it('should generate 16 from 1x2=q1/4', () => {
    const cells = LabelGenerator.generateFrom('q', '1x2=q1/4');
    expect(cells).toBeTruthy();
    expect(cells.length).toBe(16);

    // 1st quire
    let cell = cells[0];
    expect(cell.rowId).toBe('1r');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('1.1/4');
    cell = cells[1];
    expect(cell.rowId).toBe('1v');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('1.1/4');

    cell = cells[2];
    expect(cell.rowId).toBe('2r');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('1.2/4');
    cell = cells[3];
    expect(cell.rowId).toBe('2v');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('1.2/4');

    cell = cells[4];
    expect(cell.rowId).toBe('3r');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('1.3/4');
    cell = cells[5];
    expect(cell.rowId).toBe('3v');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('1.3/4');

    cell = cells[6];
    expect(cell.rowId).toBe('4r');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('1.4/4');
    cell = cells[7];
    expect(cell.rowId).toBe('4v');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('1.4/4');

    // 2nd quire
    cell = cells[8];
    expect(cell.rowId).toBe('5r');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('2.1/4');
    cell = cells[9];
    expect(cell.rowId).toBe('5v');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('2.1/4');

    cell = cells[10];
    expect(cell.rowId).toBe('6r');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('2.2/4');
    cell = cells[11];
    expect(cell.rowId).toBe('6v');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('2.2/4');

    cell = cells[12];
    expect(cell.rowId).toBe('7r');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('2.3/4');
    cell = cells[13];
    expect(cell.rowId).toBe('7v');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('2.3/4');

    cell = cells[14];
    expect(cell.rowId).toBe('8r');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('2.4/4');
    cell = cells[15];
    expect(cell.rowId).toBe('8v');
    expect(cell.id).toBe('q');
    expect(cell.value).toBe('2.4/4');
  });

  // set-action
  it('should parse 1r:=x', () => {
    const action = LabelGenerator.parseSetAction('1r:=x') as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(1);
    expect(action!.value).toBe('x');
    // 1r
    expect(action.pages[0].type).toBe(CodRowType.Body);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBeFalse();
  });

  it('should parse 1v:=x', () => {
    const action = LabelGenerator.parseSetAction('1v:=x') as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(1);
    expect(action!.value).toBe('x');
    // 1r
    expect(action.pages[0].type).toBe(CodRowType.Body);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBeTrue();
  });

  it('should parse (1r):=x', () => {
    const action = LabelGenerator.parseSetAction(
      '(1r):=x'
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(1);
    expect(action!.value).toBe('x');
    // (1r)
    expect(action.pages[0].type).toBe(CodRowType.EndleafFront);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBeFalse();
  });

  it('should parse (/1r):=x', () => {
    const action = LabelGenerator.parseSetAction(
      '(/1r):=x'
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(1);
    expect(action!.value).toBe('x');
    // (/1r)
    expect(action.pages[0].type).toBe(CodRowType.EndleafBack);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBeFalse();
  });

  it('should parse 1r 3v:=x', () => {
    const action = LabelGenerator.parseSetAction(
      '1r 3v:=x'
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(2);
    expect(action!.value).toBe('x');
    // 1r
    expect(action.pages[0].type).toBe(CodRowType.Body);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBeFalse();
    // 3v
    expect(action.pages[1].type).toBe(CodRowType.Body);
    expect(action.pages[1].n).toBe(3);
    expect(action.pages[1].v).toBeTrue();
  });

  it('should parse (1r) 2r (/3v):=x', () => {
    const action = LabelGenerator.parseSetAction(
      '(1r) 2r (/3v):=x'
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(3);
    expect(action!.value).toBe('x');
    // (1r)
    expect(action.pages[0].type).toBe(CodRowType.EndleafFront);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBeFalse();
    // 2r
    expect(action.pages[1].type).toBe(CodRowType.Body);
    expect(action.pages[1].n).toBe(2);
    expect(action.pages[1].v).toBeFalse();
    // (/3v)
    expect(action.pages[2].type).toBe(CodRowType.EndleafBack);
    expect(action.pages[2].n).toBe(3);
    expect(action.pages[2].v).toBeTrue();
  });

  it('should parse 1r-2v:=x', () => {
    const action = LabelGenerator.parseSetAction(
      '1r-2v:=x'
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(4);
    expect(action!.value).toBe('x');
    // 1r
    expect(action.pages[0].type).toBe(CodRowType.Body);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBeFalse();
    // 1v
    expect(action.pages[1].type).toBe(CodRowType.Body);
    expect(action.pages[1].n).toBe(1);
    expect(action.pages[1].v).toBeTrue();
    // 2r
    expect(action.pages[2].type).toBe(CodRowType.Body);
    expect(action.pages[2].n).toBe(2);
    expect(action.pages[2].v).toBeFalse();
    // 2v
    expect(action.pages[3].type).toBe(CodRowType.Body);
    expect(action.pages[3].n).toBe(2);
    expect(action.pages[3].v).toBeTrue();
  });
});

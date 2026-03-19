import { CodRowType } from './cod-sheet-table';
import {
  CodLabelAction,
  CodLabelActionType,
  CodLabelSetAction,
  LabelGenerator,
} from './label-generator';

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
    const action = LabelGenerator.parseAction('1x2=') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBeFalsy();
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1x2=custom"', () => {
    const action = LabelGenerator.parseAction('1x2=custom') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1rx2=custom"', () => {
    const action = LabelGenerator.parseAction('1rx2=custom') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1vx2=custom"', () => {
    const action = LabelGenerator.parseAction('1vx2=custom') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(true);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1r*2=custom"', () => {
    const action = LabelGenerator.parseAction('1r*2=custom') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1r%2=custom"', () => {
    const action = LabelGenerator.parseAction('1r%2=custom') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBe(true);
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1r x 2 = custom"', () => {
    const action = LabelGenerator.parseAction(
      '1r x 2 = custom',
    ) as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1x2=12"', () => {
    const action = LabelGenerator.parseAction('1x2=12') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('12');
    expect(action!.type).toBe(CodLabelActionType.Arabic);
  });
  it('should parse "1x2=II"', () => {
    const action = LabelGenerator.parseAction('1x2=II') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('II');
    expect(action!.type).toBe(CodLabelActionType.UpperRoman);
  });
  it('should parse "1x2=X"', () => {
    const action = LabelGenerator.parseAction('1x2=X') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('X');
    expect(action!.type).toBe(CodLabelActionType.UpperRoman);
  });
  it('should parse "1x2="X" as custom"', () => {
    const action = LabelGenerator.parseAction('1x2="X"') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('X');
    expect(action!.type).toBe(CodLabelActionType.Custom);
  });
  it('should parse "1x2=ii"', () => {
    const action = LabelGenerator.parseAction('1x2=ii') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('ii');
    expect(action!.type).toBe(CodLabelActionType.LowerRoman);
  });
  it('should parse "1x2=b"', () => {
    const action = LabelGenerator.parseAction('1x2=b') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('b');
    expect(action!.type).toBe(CodLabelActionType.LatLowerLetter);
  });
  it('should parse "1x2=B"', () => {
    const action = LabelGenerator.parseAction('1x2=B') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('B');
    expect(action!.type).toBe(CodLabelActionType.LatUpperLetter);
  });
  it('should parse "1x2=Β"', () => {
    const action = LabelGenerator.parseAction('1x2=Β') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('Β');
    expect(action!.type).toBe(CodLabelActionType.GrcUpperLetter);
  });
  it('should parse "1x2=β"', () => {
    const action = LabelGenerator.parseAction('1x2=β') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('β');
    expect(action!.type).toBe(CodLabelActionType.GrcLowerLetter);
  });
  it('should parse "1x2=q1/4"', () => {
    const action = LabelGenerator.parseAction('1x2=q1/4') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action!.n).toBe(1);
    expect(action!.v).toBe(false);
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
    expect(action.pages[0].v).toBe(false);
  });

  it('should parse 1v:=x', () => {
    const action = LabelGenerator.parseSetAction('1v:=x') as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(1);
    expect(action!.value).toBe('x');
    // 1r
    expect(action.pages[0].type).toBe(CodRowType.Body);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBe(true);
  });

  it('should parse (1r):=x', () => {
    const action = LabelGenerator.parseSetAction(
      '(1r):=x',
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(1);
    expect(action!.value).toBe('x');
    // (1r)
    expect(action.pages[0].type).toBe(CodRowType.EndleafFront);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBe(false);
  });

  it('should parse (/1r):=x', () => {
    const action = LabelGenerator.parseSetAction(
      '(/1r):=x',
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(1);
    expect(action!.value).toBe('x');
    // (/1r)
    expect(action.pages[0].type).toBe(CodRowType.EndleafBack);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBe(false);
  });

  it('should parse 1r 3v:=x', () => {
    const action = LabelGenerator.parseSetAction(
      '1r 3v:=x',
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(2);
    expect(action!.value).toBe('x');
    // 1r
    expect(action.pages[0].type).toBe(CodRowType.Body);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBe(false);
    // 3v
    expect(action.pages[1].type).toBe(CodRowType.Body);
    expect(action.pages[1].n).toBe(3);
    expect(action.pages[1].v).toBe(true);
  });

  it('should parse (1r) 2r (/3v):=x', () => {
    const action = LabelGenerator.parseSetAction(
      '(1r) 2r (/3v):=x',
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(3);
    expect(action!.value).toBe('x');
    // (1r)
    expect(action.pages[0].type).toBe(CodRowType.EndleafFront);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBe(false);
    // 2r
    expect(action.pages[1].type).toBe(CodRowType.Body);
    expect(action.pages[1].n).toBe(2);
    expect(action.pages[1].v).toBe(false);
    // (/3v)
    expect(action.pages[2].type).toBe(CodRowType.EndleafBack);
    expect(action.pages[2].n).toBe(3);
    expect(action.pages[2].v).toBe(true);
  });

  it('should parse 1r-2v:=x', () => {
    const action = LabelGenerator.parseSetAction(
      '1r-2v:=x',
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(4);
    expect(action!.value).toBe('x');
    expect(action!.step).toBe(1);
    // 1r
    expect(action.pages[0].type).toBe(CodRowType.Body);
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBe(false);
    // 1v
    expect(action.pages[1].type).toBe(CodRowType.Body);
    expect(action.pages[1].n).toBe(1);
    expect(action.pages[1].v).toBe(true);
    // 2r
    expect(action.pages[2].type).toBe(CodRowType.Body);
    expect(action.pages[2].n).toBe(2);
    expect(action.pages[2].v).toBe(false);
    // 2v
    expect(action.pages[3].type).toBe(CodRowType.Body);
    expect(action.pages[3].n).toBe(2);
    expect(action.pages[3].v).toBe(true);
  });

  // step in ADD action
  it('should parse "1r%3:2=1" with step 2', () => {
    const action = LabelGenerator.parseAction('1r%3:2=1') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action.n).toBe(1);
    expect(action.v).toBe(false);
    expect(action.page).toBe(true);
    expect(action.count).toBe(3);
    expect(action.step).toBe(2);
    expect(action.value).toBe('1');
    expect(action.type).toBe(CodLabelActionType.Arabic);
  });

  it('should parse "1rx3:2=10" with step 2', () => {
    const action = LabelGenerator.parseAction('1rx3:2=10') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action.n).toBe(1);
    expect(action.v).toBe(false);
    expect(action.page).toBeFalsy();
    expect(action.count).toBe(3);
    expect(action.step).toBe(2);
    expect(action.value).toBe('10');
    expect(action.type).toBe(CodLabelActionType.Arabic);
  });

  it('should parse "1r%4:2=ii" with step 2', () => {
    const action = LabelGenerator.parseAction('1r%4:2=ii') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action.step).toBe(2);
    expect(action.value).toBe('ii');
    expect(action.type).toBe(CodLabelActionType.LowerRoman);
  });

  it('should parse "1x3=10" with default step 1', () => {
    const action = LabelGenerator.parseAction('1x3=10') as CodLabelAction;
    expect(action).toBeTruthy();
    expect(action.step).toBe(1);
  });

  // generator with step
  // Step controls WHICH rows are skipped, not how much the value jumps.
  // The value always advances by 1 for every row (including skipped ones),
  // so skipped rows "consume" numbers without producing a label.

  it('should generate 2 labeled pages from 1r%3:2=1 with step 2', () => {
    // 3 pages total: 1r(pos 0, labeled), 1v(pos 1, skipped), 2r(pos 2, labeled).
    // Value advances by 1 for every page, so 1v would be 2 but is skipped → 2r=3.
    const cells = LabelGenerator.generateFrom('n', '1r%3:2=1');
    expect(cells.length).toBe(2);
    expect(cells[0].rowId).toBe('1r');
    expect(cells[0].value).toBe('1');
    expect(cells[1].rowId).toBe('2r');
    expect(cells[1].value).toBe('3');
  });

  it('should generate 4 labeled pages from 1rx3:2=10 with step 2', () => {
    // 3 sheets (6 pages) total. Step applies per-sheet:
    // sheet 0 (1r,1v): labeled as 10; sheet 1 (2r,2v): skipped (value 11 consumed);
    // sheet 2 (3r,3v): labeled as 12.
    const cells = LabelGenerator.generateFrom('n', '1rx3:2=10');
    expect(cells.length).toBe(4);
    expect(cells[0].rowId).toBe('1r');
    expect(cells[0].value).toBe('10r');
    expect(cells[1].rowId).toBe('1v');
    expect(cells[1].value).toBe('10v');
    expect(cells[2].rowId).toBe('3r');
    expect(cells[2].value).toBe('12r');
    expect(cells[3].rowId).toBe('3v');
    expect(cells[3].value).toBe('12v');
  });

  it('should generate 2 labeled pages from 1r%4:2=ii (lower roman, step 2)', () => {
    // 4 pages: 1r(pos 0, labeled=ii), 1v(pos 1, skipped=iii consumed),
    //          2r(pos 2, labeled=iv), 2v(pos 3, skipped).
    const cells = LabelGenerator.generateFrom('n', '1r%4:2=ii');
    expect(cells.length).toBe(2);
    expect(cells[0].rowId).toBe('1r');
    expect(cells[0].value).toBe('ii');
    expect(cells[1].rowId).toBe('2r');
    expect(cells[1].value).toBe('iv');
  });

  it('should generate 3 labeled pages from 1r%7:3=a (lat lower letter, step 3)', () => {
    // 7 pages: labeled at positions 0(1r=a), 3(2v=d), 6(4r=g).
    // Positions 1,2,4,5 are skipped but each consumes one letter.
    const cells = LabelGenerator.generateFrom('n', '1r%7:3=a');
    expect(cells.length).toBe(3);
    expect(cells[0].rowId).toBe('1r');
    expect(cells[0].value).toBe('a');
    expect(cells[1].rowId).toBe('2v');
    expect(cells[1].value).toBe('d');
    expect(cells[2].rowId).toBe('4r');
    expect(cells[2].value).toBe('g');
  });

  // step in SET action
  it('should parse 1r-2v:2:=x with step 2', () => {
    const action = LabelGenerator.parseSetAction(
      '1r-2v:2:=x',
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(4);
    expect(action.step).toBe(2);
    expect(action.value).toBe('x');
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBe(false);
    expect(action.pages[1].n).toBe(1);
    expect(action.pages[1].v).toBe(true);
    expect(action.pages[2].n).toBe(2);
    expect(action.pages[2].v).toBe(false);
    expect(action.pages[3].n).toBe(2);
    expect(action.pages[3].v).toBe(true);
  });

  it('should parse 1r:2:=x (single location, step 2)', () => {
    const action = LabelGenerator.parseSetAction(
      '1r:2:=x',
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(1);
    expect(action.step).toBe(2);
    expect(action.value).toBe('x');
    expect(action.pages[0].n).toBe(1);
    expect(action.pages[0].v).toBe(false);
  });

  it('should parse 1r 2r:3:=y (space-separated, step 3)', () => {
    const action = LabelGenerator.parseSetAction(
      '1r 2r:3:=y',
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect(action.pages.length).toBe(2);
    expect(action.step).toBe(3);
    expect(action.value).toBe('y');
  });

  // generateSet
  it('should generateSet 4 cells from 1r-2v:=1 (step 1, Arabic)', () => {
    // step=1: all rows labeled, value increments by 1 for each row
    const action = LabelGenerator.parseSetAction('1r-2v:=1') as CodLabelSetAction;
    const cells = LabelGenerator.generateSet('n', action);
    expect(cells.length).toBe(4);
    expect(cells[0]).toEqual({ rowId: '1r', id: 'n', value: '1' });
    expect(cells[1]).toEqual({ rowId: '1v', id: 'n', value: '2' });
    expect(cells[2]).toEqual({ rowId: '2r', id: 'n', value: '3' });
    expect(cells[3]).toEqual({ rowId: '2v', id: 'n', value: '4' });
  });

  it('should generateSet 2 labeled cells from 1r-2v:2:=1 (step 2, Arabic)', () => {
    // step=2: even positions (0, 2) labeled; odd positions skipped but consume counter
    // 1r(pos 0)=1, 1v(pos 1) skipped (would be 2), 2r(pos 2)=3, 2v(pos 3) skipped
    const action = LabelGenerator.parseSetAction('1r-2v:2:=1') as CodLabelSetAction;
    const cells = LabelGenerator.generateSet('n', action);
    expect(cells.length).toBe(2);
    expect(cells[0]).toEqual({ rowId: '1r', id: 'n', value: '1' });
    expect(cells[1]).toEqual({ rowId: '2r', id: 'n', value: '3' });
  });

  it('should generateSet constant value for custom string', () => {
    // custom (multi-char, non-roman) value stays the same for all rows
    const action = LabelGenerator.parseSetAction('1r-2v:=custom') as CodLabelSetAction;
    const cells = LabelGenerator.generateSet('n', action);
    expect(cells.length).toBe(4);
    expect(cells[0].value).toBe('custom');
    expect(cells[1].value).toBe('custom');
    expect(cells[2].value).toBe('custom');
    expect(cells[3].value).toBe('custom');
  });

  it('should generateSet lower roman with step 2', () => {
    // 1r-4v: 8 pages, step=2 → 4 labeled at positions 0,2,4,6
    // values: ii(0), skip iii, iv(2), skip v, vi(4), skip vii, viii(6)
    const action = LabelGenerator.parseSetAction('1r-4v:2:=ii') as CodLabelSetAction;
    const cells = LabelGenerator.generateSet('n', action);
    expect(cells.length).toBe(4);
    expect(cells[0]).toEqual({ rowId: '1r', id: 'n', value: 'ii' });
    expect(cells[1]).toEqual({ rowId: '2r', id: 'n', value: 'iv' });
    expect(cells[2]).toEqual({ rowId: '3r', id: 'n', value: 'vi' });
    expect(cells[3]).toEqual({ rowId: '4r', id: 'n', value: 'viii' });
  });

  // parseAction dispatches SET actions correctly (including single-location)
  it('should dispatch 1r:=x as set action via parseAction', () => {
    const action = LabelGenerator.parseAction('1r:=x') as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect((action as CodLabelSetAction).pages).toBeTruthy();
    expect((action as CodLabelSetAction).pages.length).toBe(1);
    expect((action as CodLabelSetAction).value).toBe('x');
  });

  it('should dispatch 1r-2v:2:=x as set action via parseAction', () => {
    const action = LabelGenerator.parseAction(
      '1r-2v:2:=x',
    ) as CodLabelSetAction;
    expect(action).toBeTruthy();
    expect((action as CodLabelSetAction).pages.length).toBe(4);
    expect((action as CodLabelSetAction).step).toBe(2);
    expect((action as CodLabelSetAction).value).toBe('x');
  });
});

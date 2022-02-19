import { LabelActionValueType, LabelGenerator } from './label-generator';

describe('LabelGenerator', () => {
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
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBeFalsy();
    expect(action!.valueType).toBe(LabelActionValueType.Custom);
  });
  it('should parse "1x2=custom"', () => {
    const action = LabelGenerator.parseAction('1x2=custom');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.valueType).toBe(LabelActionValueType.Custom);
  });
  it('should parse "1rx2=custom"', () => {
    const action = LabelGenerator.parseAction('1rx2=custom');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.valueType).toBe(LabelActionValueType.Custom);
  });
  it('should parse "1vx2=custom"', () => {
    const action = LabelGenerator.parseAction('1vx2=custom');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeTrue();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.valueType).toBe(LabelActionValueType.Custom);
  });
  it('should parse "1r*2=custom"', () => {
    const action = LabelGenerator.parseAction('1r*2=custom');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.valueType).toBe(LabelActionValueType.Custom);
  });
  it('should parse "1r%2=custom"', () => {
    const action = LabelGenerator.parseAction('1r%2=custom');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeTrue();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.valueType).toBe(LabelActionValueType.Custom);
  });
  it('should parse "1r x 2 = custom"', () => {
    const action = LabelGenerator.parseAction('1r x 2 = custom');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('custom');
    expect(action!.valueType).toBe(LabelActionValueType.Custom);
  });
  it('should parse "1x2=12"', () => {
    const action = LabelGenerator.parseAction('1x2=12');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('12');
    expect(action!.valueType).toBe(LabelActionValueType.Arabic);
  });
  it('should parse "1x2=II"', () => {
    const action = LabelGenerator.parseAction('1x2=II');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('II');
    expect(action!.valueType).toBe(LabelActionValueType.UpperRoman);
  });
  it('should parse "1x2=ii"', () => {
    const action = LabelGenerator.parseAction('1x2=ii');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('ii');
    expect(action!.valueType).toBe(LabelActionValueType.LowerRoman);
  });
  it('should parse "1x2=b"', () => {
    const action = LabelGenerator.parseAction('1x2=b');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('b');
    expect(action!.valueType).toBe(LabelActionValueType.LatLowerLetter);
  });
  it('should parse "1x2=B"', () => {
    const action = LabelGenerator.parseAction('1x2=B');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('B');
    expect(action!.valueType).toBe(LabelActionValueType.LatUpperLetter);
  });
  it('should parse "1x2=Β"', () => {
    const action = LabelGenerator.parseAction('1x2=Β');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('Β');
    expect(action!.valueType).toBe(LabelActionValueType.GrcUpperLetter);
  });
  it('should parse "1x2=β"', () => {
    const action = LabelGenerator.parseAction('1x2=β');
    expect(action).toBeTruthy();
    expect(action!.start).toBe(1);
    expect(action!.v).toBeFalse();
    expect(action!.page).toBeFalsy();
    expect(action!.count).toBe(2);
    expect(action!.value).toBe('β');
    expect(action!.valueType).toBe(LabelActionValueType.GrcLowerLetter);
  });
});

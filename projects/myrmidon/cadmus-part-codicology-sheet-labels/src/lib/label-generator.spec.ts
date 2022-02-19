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
});

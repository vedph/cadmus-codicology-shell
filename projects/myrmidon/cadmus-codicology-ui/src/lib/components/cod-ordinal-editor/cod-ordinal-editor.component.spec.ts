import { render } from '@testing-library/angular';
import { CodOrdinalEditor } from './cod-ordinal-editor';

describe('CodOrdinalEditor', () => {
  it('should create', async () => {
    const { fixture } = await render(CodOrdinalEditor);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

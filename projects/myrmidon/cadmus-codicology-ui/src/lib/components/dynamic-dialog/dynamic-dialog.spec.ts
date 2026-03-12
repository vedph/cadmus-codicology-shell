import { render } from '@testing-library/angular';
import { DynamicDialog } from './dynamic-dialog';

describe('DynamicDialog', () => {
  it('should create', async () => {
    const { fixture } = await render(DynamicDialog);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

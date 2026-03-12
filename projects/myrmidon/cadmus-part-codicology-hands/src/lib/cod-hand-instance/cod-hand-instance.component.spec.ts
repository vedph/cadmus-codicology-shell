import { render } from '@testing-library/angular';
import { CodHandInstanceComponent } from './cod-hand-instance.component';

describe('CodHandInstanceComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodHandInstanceComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

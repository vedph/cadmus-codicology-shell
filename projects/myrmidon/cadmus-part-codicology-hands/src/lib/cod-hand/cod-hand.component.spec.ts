import { render } from '@testing-library/angular';
import { CodHandComponent } from './cod-hand.component';

describe('CodHandComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodHandComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

import { render } from '@testing-library/angular';
import { CodHandSignComponent } from './cod-hand-sign.component';

describe('CodHandSignComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodHandSignComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

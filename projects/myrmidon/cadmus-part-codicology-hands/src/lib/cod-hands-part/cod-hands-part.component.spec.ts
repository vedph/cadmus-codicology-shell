import { render } from '@testing-library/angular';
import { CodHandsPartComponent } from './cod-hands-part.component';

describe('CodHandsPartComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodHandsPartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

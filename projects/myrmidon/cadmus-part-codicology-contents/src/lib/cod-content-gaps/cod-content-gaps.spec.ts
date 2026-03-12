import { render } from '@testing-library/angular';
import { CodContentGapsComponent } from './cod-content-gaps.component';

describe('CodContentGapsComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodContentGapsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

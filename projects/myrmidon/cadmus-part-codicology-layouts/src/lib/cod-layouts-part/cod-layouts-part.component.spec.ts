import { render } from '@testing-library/angular';
import { CodLayoutsPartComponent } from './cod-layouts-part.component';

describe('CodLayoutsPartComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodLayoutsPartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

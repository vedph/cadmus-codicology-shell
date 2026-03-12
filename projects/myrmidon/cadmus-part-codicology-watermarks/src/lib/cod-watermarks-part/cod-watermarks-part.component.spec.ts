import { render } from '@testing-library/angular';
import { CodWatermarksPartComponent } from './cod-watermarks-part.component';

describe('CodWatermarksPartComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodWatermarksPartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

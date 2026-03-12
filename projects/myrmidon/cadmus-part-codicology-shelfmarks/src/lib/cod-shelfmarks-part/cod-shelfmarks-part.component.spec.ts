import { render } from '@testing-library/angular';
import { CodShelfmarksPartComponent } from './cod-shelfmarks-part.component';

describe('CodShelfmarksPartComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodShelfmarksPartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

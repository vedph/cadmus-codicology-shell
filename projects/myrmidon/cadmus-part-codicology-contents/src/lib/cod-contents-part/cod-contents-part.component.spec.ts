import { render } from '@testing-library/angular';
import { CodContentsPartComponent } from './cod-contents-part.component';

describe('CodContentsPartComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodContentsPartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

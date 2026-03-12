import { render } from '@testing-library/angular';
import { CodDecorationsPartComponent } from './cod-decorations-part.component';

describe('CodDecorationsPartComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodDecorationsPartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

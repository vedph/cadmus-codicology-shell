import { render } from '@testing-library/angular';
import { CodDecorationComponent } from './cod-decoration.component';

describe('CodDecorationComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodDecorationComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

import { render } from '@testing-library/angular';
import { CodDecorationElementComponent } from './cod-decoration-element.component';

describe('CodDecorationElementComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodDecorationElementComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

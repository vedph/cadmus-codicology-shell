import { render } from '@testing-library/angular';
import { CodBindingsPartComponent } from './cod-bindings-part.component';

describe('CodBindingsPartComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodBindingsPartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

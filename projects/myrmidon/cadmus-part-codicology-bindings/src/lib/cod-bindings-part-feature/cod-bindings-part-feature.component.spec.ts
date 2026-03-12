import { render } from '@testing-library/angular';
import { CodBindingsPartFeatureComponent } from './cod-bindings-part-feature.component';

describe('CodBindingsPartFeatureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodBindingsPartFeatureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

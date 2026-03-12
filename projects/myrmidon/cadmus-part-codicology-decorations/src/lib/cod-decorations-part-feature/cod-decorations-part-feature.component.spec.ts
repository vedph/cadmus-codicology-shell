import { render } from '@testing-library/angular';
import { CodDecorationsPartFeatureComponent } from './cod-decorations-part-feature.component';

describe('CodDecorationsPartFeatureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodDecorationsPartFeatureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

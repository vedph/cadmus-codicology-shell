import { render } from '@testing-library/angular';
import { CodLayoutsPartFeatureComponent } from './cod-layouts-part-feature.component';

describe('CodLayoutsPartFeatureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodLayoutsPartFeatureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

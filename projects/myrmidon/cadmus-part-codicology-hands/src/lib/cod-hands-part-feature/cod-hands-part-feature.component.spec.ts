import { render } from '@testing-library/angular';
import { CodHandsPartFeatureComponent } from './cod-hands-part-feature.component';

describe('CodHandsPartFeatureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodHandsPartFeatureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

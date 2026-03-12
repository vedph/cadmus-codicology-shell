import { render } from '@testing-library/angular';
import { CodWatermarksPartFeatureComponent } from './cod-watermarks-part-feature.component';

describe('CodWatermarksPartFeatureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodWatermarksPartFeatureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

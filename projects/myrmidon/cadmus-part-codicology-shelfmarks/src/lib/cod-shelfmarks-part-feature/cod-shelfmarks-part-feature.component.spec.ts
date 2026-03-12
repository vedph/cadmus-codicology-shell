import { render } from '@testing-library/angular';
import { CodShelfmarksPartFeatureComponent } from './cod-shelfmarks-part-feature.component';

describe('CodShelfmarksPartFeatureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodShelfmarksPartFeatureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

import { render } from '@testing-library/angular';
import { CodContentsPartFeatureComponent } from './cod-contents-part-feature.component';

describe('CodContentsPartFeatureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodContentsPartFeatureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

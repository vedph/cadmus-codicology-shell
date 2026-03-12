import { render } from '@testing-library/angular';
import { CodEditsPartFeatureComponent } from './cod-edits-part-feature.component';

describe('CodEditsPartFeatureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodEditsPartFeatureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

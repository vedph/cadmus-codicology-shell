import { render } from '@testing-library/angular';
import { CodMaterialDscPartFeatureComponent } from './cod-material-dsc-part-feature.component';

describe('CodMaterialDscPartFeatureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodMaterialDscPartFeatureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

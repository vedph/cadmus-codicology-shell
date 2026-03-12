import { render } from '@testing-library/angular';
import { CodMaterialDscPartComponent } from './cod-material-dsc-part.component';

describe('CodMaterialDscPartComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodMaterialDscPartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

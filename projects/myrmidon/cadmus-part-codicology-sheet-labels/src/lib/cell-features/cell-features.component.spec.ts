import { render } from '@testing-library/angular';
import { CellFeaturesComponent } from './cell-features.component';

describe('CellFeaturesComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CellFeaturesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

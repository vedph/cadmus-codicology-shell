import { render } from '@testing-library/angular';
import { CodQuireDescriptionComponent } from './cod-quire-description.component';

describe('CodQuireDescriptionComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodQuireDescriptionComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

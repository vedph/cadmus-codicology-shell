import { render } from '@testing-library/angular';
import { CodHandDescriptionComponent } from './cod-hand-description.component';

describe('CodHandDescriptionComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodHandDescriptionComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

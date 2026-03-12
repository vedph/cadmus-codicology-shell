import { render } from '@testing-library/angular';
import { CodHandSubscriptionComponent } from './cod-hand-subscription.component';

describe('CodHandSubscriptionComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodHandSubscriptionComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

import { render } from '@testing-library/angular';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(ResetPasswordComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

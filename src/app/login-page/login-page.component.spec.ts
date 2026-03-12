import { render } from '@testing-library/angular';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(LoginPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

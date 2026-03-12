import { render } from '@testing-library/angular';
import { RegisterUserPageComponent } from './register-user-page.component';

describe('RegisterUserPageComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(RegisterUserPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

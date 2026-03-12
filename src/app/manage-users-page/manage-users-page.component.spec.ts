import { render } from '@testing-library/angular';
import { ManageUsersPageComponent } from './manage-users-page.component';

describe('ManageUsersPageComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(ManageUsersPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  async function setup(user: User | null) {
    const user$ = new BehaviorSubject<User | null>(user);
    const result = await render(HomeComponent, {
      providers: [
        provideRouter([]),
        { provide: AuthJwtService, useValue: { currentUser$: user$ } },
      ],
    });
    return { ...result, user$ };
  }

  it('should show the title and resource links', async () => {
    await setup(null);

    expect(
      screen.getByRole('heading', { name: /cadmus codicology/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /models source/i }),
    ).toHaveAttribute('href', 'https://github.com/vedph/cadmus-codicology');
    expect(screen.getByRole('link', { name: /shell source/i })).toHaveAttribute(
      'href',
      'https://github.com/vedph/cadmus-codicology-shell',
    );
  });

  it('should invite to login when not logged', async () => {
    await setup(null);

    expect(
      screen.getByRole('heading', { name: 'Authentication Required' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /login to continue/i }),
    ).toBeInTheDocument();
  });

  it('should not invite to login when logged', async () => {
    await setup({ userName: 'zeus' } as User);

    expect(
      screen.queryByRole('heading', { name: 'Authentication Required' }),
    ).toBeNull();
  });

  it('should react to login changes', async () => {
    const { user$, fixture } = await setup(null);

    user$.next({ userName: 'zeus' } as User);
    fixture.detectChanges();

    expect(
      screen.queryByRole('heading', { name: 'Authentication Required' }),
    ).toBeNull();
  });
});

import { render } from '@testing-library/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(HomeComponent, {
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});

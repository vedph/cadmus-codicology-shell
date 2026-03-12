import { render } from '@testing-library/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CodEndleafComponent } from './cod-endleaf.component';

describe('CodEndleafComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodEndleafComponent, {
      providers: [provideNoopAnimations()],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});

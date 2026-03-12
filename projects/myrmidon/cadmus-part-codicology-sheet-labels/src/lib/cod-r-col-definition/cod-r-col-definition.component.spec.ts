import { render } from '@testing-library/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CodRColDefinitionComponent } from './cod-r-col-definition.component';

describe('CodRColDefinitionComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodRColDefinitionComponent, {
      providers: [provideNoopAnimations()],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});

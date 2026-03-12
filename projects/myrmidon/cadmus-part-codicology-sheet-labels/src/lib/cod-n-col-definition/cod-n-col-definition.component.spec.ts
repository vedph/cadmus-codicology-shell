import { render } from '@testing-library/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CodNColDefinitionComponent } from './cod-n-col-definition.component';

describe('CodNColDefinitionComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodNColDefinitionComponent, {
      providers: [provideNoopAnimations()],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});

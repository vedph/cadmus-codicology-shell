import { render } from '@testing-library/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CodCColDefinitionComponent } from './cod-c-col-definition.component';

describe('CodCColDefinitionComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodCColDefinitionComponent, {
      providers: [provideNoopAnimations()],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});

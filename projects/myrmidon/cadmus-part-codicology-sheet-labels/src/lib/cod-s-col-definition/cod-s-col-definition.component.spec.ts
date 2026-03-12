import { render } from '@testing-library/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CodSColDefinitionComponent } from './cod-s-col-definition.component';

describe('CodSColDefinitionComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodSColDefinitionComponent, {
      providers: [provideNoopAnimations()],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});

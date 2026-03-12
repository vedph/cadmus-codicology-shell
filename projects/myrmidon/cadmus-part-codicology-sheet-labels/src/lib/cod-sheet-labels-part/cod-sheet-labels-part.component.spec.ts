import { render } from '@testing-library/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CodSheetLabelsPartComponent } from './cod-sheet-labels-part.component';

describe('CodSheetLabelsPartComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodSheetLabelsPartComponent, {
      providers: [provideNoopAnimations()],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});

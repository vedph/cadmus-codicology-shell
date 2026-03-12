import { render } from '@testing-library/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CodSheetLabelsPartFeatureComponent } from './cod-sheet-labels-part-feature.component';

describe.skip('CodSheetLabelsPartFeatureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodSheetLabelsPartFeatureComponent, {
      providers: [
        provideNoopAnimations(),
      { provide: 'partEditorKeys', useValue: {} },
      ],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});

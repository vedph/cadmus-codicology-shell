import { render } from '@testing-library/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CodLabelCellComponent } from './cod-label-cell.component';

describe('CodLabelCellComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodLabelCellComponent, {
      providers: [provideNoopAnimations()],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});

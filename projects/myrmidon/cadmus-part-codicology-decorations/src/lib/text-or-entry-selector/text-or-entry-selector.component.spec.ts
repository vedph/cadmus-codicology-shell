import { render } from '@testing-library/angular';
import { TextOrEntrySelectorComponent } from './text-or-entry-selector.component';

describe('TextOrEntrySelectorComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(TextOrEntrySelectorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

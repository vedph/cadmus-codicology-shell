import { render } from '@testing-library/angular';
import { CodEditsPartComponent } from './cod-edits-part.component';

describe('CodEditsPartComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodEditsPartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

import { render } from '@testing-library/angular';
import { CitationPicker } from './citation-picker';

describe('CitationPicker', () => {
  it('should create', async () => {
    const { fixture } = await render(CitationPicker);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

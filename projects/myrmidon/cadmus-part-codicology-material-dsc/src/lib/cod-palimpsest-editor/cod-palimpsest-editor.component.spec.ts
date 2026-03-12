import { render } from '@testing-library/angular';
import { CodPalimpsestEditorComponent } from './cod-palimpsest-editor.component';

describe('CodPalimpsestEditorComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodPalimpsestEditorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

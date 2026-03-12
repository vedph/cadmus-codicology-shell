import { render } from '@testing-library/angular';
import { CodShelfmarkEditorComponent } from './cod-shelfmark-editor.component';

describe('CodShelfmarkEditorComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodShelfmarkEditorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

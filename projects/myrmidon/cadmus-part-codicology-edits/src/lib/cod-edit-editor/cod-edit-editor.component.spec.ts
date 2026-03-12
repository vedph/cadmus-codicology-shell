import { render } from '@testing-library/angular';
import { CodEditEditorComponent } from './cod-edit-editor.component';

describe('CodEditEditorComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodEditEditorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

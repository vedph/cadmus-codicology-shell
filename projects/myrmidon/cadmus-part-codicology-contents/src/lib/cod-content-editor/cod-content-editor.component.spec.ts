import { render } from '@testing-library/angular';
import { CodContentEditorComponent } from './cod-content-editor.component';

describe('CodContentEditorComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodContentEditorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

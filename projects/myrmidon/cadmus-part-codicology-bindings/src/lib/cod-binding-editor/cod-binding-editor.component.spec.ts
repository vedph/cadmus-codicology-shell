import { render } from '@testing-library/angular';
import { CodBindingEditorComponent } from './cod-binding-editor.component';

describe('CodBindingEditorComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodBindingEditorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

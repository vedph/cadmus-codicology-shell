import { render } from '@testing-library/angular';
import { CodLayoutEditorComponent } from './cod-layout-editor.component';

describe('CodLayoutEditorComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodLayoutEditorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

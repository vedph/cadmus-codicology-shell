import { render } from '@testing-library/angular';
import { CodWatermarkEditorComponent } from './cod-watermark-editor.component';

describe('CodWatermarkEditorComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodWatermarkEditorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

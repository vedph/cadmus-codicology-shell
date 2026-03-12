import { render } from '@testing-library/angular';
import { CodUnitEditorComponent } from './cod-unit-editor.component';

describe('CodUnitEditorComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodUnitEditorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

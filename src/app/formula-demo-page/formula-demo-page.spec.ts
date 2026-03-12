import { render } from '@testing-library/angular';
import { FormulaDemoPage } from './formula-demo-page';

describe('FormulaDemoPage', () => {
  it('should create', async () => {
    const { fixture } = await render(FormulaDemoPage);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

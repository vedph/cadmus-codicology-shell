import { render } from '@testing-library/angular';
import { CodLayoutFormula } from './cod-layout-formula';

describe('CodLayoutFormula', () => {
  it('should create', async () => {
    const { fixture } = await render(CodLayoutFormula);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

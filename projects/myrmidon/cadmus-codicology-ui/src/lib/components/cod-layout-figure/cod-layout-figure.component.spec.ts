import { render } from '@testing-library/angular';
import { CodLayoutFigureComponent } from './cod-layout-figure.component';

describe('CodLayoutFigureComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodLayoutFigureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

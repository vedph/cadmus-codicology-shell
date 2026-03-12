import { render } from '@testing-library/angular';
import { CodLocationConverterComponent } from './cod-location-converter.component';

describe('CodLocationConverterComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodLocationConverterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

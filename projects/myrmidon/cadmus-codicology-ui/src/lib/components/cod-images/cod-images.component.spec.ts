import { render } from '@testing-library/angular';
import { CodImagesComponent } from './cod-images.component';

describe('CodImagesComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodImagesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

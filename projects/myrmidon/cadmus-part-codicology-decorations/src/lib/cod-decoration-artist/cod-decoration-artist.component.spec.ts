import { render } from '@testing-library/angular';
import { CodDecorationArtistComponent } from './cod-decoration-artist.component';

describe('CodDecorationArtistComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodDecorationArtistComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

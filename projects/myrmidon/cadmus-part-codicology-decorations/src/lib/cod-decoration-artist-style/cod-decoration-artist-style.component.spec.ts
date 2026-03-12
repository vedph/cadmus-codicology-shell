import { render } from '@testing-library/angular';
import { CodDecorationArtistStyleComponent } from './cod-decoration-artist-style.component';

describe('CodDecorationArtistStyleComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodDecorationArtistStyleComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

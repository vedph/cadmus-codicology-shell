import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodDecorationArtistComponent } from './cod-decoration-artist.component';

describe('CodDecorationArtistComponent', () => {
  let component: CodDecorationArtistComponent;
  let fixture: ComponentFixture<CodDecorationArtistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodDecorationArtistComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodDecorationArtistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

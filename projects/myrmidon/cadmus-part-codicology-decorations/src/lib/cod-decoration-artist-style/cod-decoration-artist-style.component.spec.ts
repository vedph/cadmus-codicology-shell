import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodDecorationArtistStyleComponent } from './cod-decoration-artist-style.component';

describe('CodDecorationArtistStyleComponent', () => {
  let component: CodDecorationArtistStyleComponent;
  let fixture: ComponentFixture<CodDecorationArtistStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodDecorationArtistStyleComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodDecorationArtistStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

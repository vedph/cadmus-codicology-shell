import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodImagesComponent } from './cod-images.component';

describe('CodImagesComponent', () => {
  let component: CodImagesComponent;
  let fixture: ComponentFixture<CodImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodImagesComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

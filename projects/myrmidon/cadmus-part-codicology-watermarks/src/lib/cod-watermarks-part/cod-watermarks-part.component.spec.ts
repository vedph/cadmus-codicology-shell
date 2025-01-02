import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodWatermarksPartComponent } from './cod-watermarks-part.component';

describe('CodWatermarksPartComponent', () => {
  let component: CodWatermarksPartComponent;
  let fixture: ComponentFixture<CodWatermarksPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodWatermarksPartComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodWatermarksPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

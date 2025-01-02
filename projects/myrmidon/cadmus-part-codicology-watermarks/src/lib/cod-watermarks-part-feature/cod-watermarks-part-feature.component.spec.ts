import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodWatermarksPartFeatureComponent } from './cod-watermarks-part-feature.component';

describe('CodWatermarksPartFeatureComponent', () => {
  let component: CodWatermarksPartFeatureComponent;
  let fixture: ComponentFixture<CodWatermarksPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodWatermarksPartFeatureComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodWatermarksPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

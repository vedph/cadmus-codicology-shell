import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodHandsPartFeatureComponent } from './cod-hands-part-feature.component';

describe('CodHandsPartFeatureComponent', () => {
  let component: CodHandsPartFeatureComponent;
  let fixture: ComponentFixture<CodHandsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodHandsPartFeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodHandsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

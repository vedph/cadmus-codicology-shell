import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodLayoutsPartFeatureComponent } from './cod-layouts-part-feature.component';

describe('CodLayoutsPartFeatureComponent', () => {
  let component: CodLayoutsPartFeatureComponent;
  let fixture: ComponentFixture<CodLayoutsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodLayoutsPartFeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodLayoutsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

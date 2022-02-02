import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodEditsPartFeatureComponent } from './cod-edits-part-feature.component';

describe('CodEditsPartFeatureComponent', () => {
  let component: CodEditsPartFeatureComponent;
  let fixture: ComponentFixture<CodEditsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodEditsPartFeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodEditsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodSheetLabelsPartFeatureComponent } from './cod-sheet-labels-part-feature.component';

describe('CodSheetLabelsPartFeatureComponent', () => {
  let component: CodSheetLabelsPartFeatureComponent;
  let fixture: ComponentFixture<CodSheetLabelsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodSheetLabelsPartFeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodSheetLabelsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

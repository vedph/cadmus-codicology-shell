import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodDecorationsPartFeatureComponent } from './cod-decorations-part-feature.component';

describe('CodDecorationsPartFeatureComponent', () => {
  let component: CodDecorationsPartFeatureComponent;
  let fixture: ComponentFixture<CodDecorationsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodDecorationsPartFeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodDecorationsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

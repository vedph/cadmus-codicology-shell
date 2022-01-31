import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodContentsPartFeatureComponent } from './cod-contents-part-feature.component';

describe('CodContentsPartFeatureComponent', () => {
  let component: CodContentsPartFeatureComponent;
  let fixture: ComponentFixture<CodContentsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodContentsPartFeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodContentsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

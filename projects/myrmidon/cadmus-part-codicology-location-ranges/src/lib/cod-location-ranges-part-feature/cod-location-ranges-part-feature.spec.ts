import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodLocationRangesPartFeature } from './cod-location-ranges-part-feature';

describe('CodLocationRangesPartFeature', () => {
  let component: CodLocationRangesPartFeature;
  let fixture: ComponentFixture<CodLocationRangesPartFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodLocationRangesPartFeature]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodLocationRangesPartFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

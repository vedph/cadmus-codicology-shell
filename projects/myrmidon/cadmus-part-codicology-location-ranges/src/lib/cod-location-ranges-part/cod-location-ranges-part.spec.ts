import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodLocationRangesPartComponent } from './cod-location-ranges-part';

describe('CodLocationRangesPartComponent', () => {
  let component: CodLocationRangesPartComponent;
  let fixture: ComponentFixture<CodLocationRangesPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodLocationRangesPartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CodLocationRangesPartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

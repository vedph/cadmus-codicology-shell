import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellFeaturesComponent } from './cell-features.component';

describe('CellFeaturesComponent', () => {
  let component: CellFeaturesComponent;
  let fixture: ComponentFixture<CellFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellFeaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

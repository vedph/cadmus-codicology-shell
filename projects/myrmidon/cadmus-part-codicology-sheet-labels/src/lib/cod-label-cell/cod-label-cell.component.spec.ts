import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodLabelCellComponent } from './cod-label-cell.component';

describe('CodLabelCellComponent', () => {
  let component: CodLabelCellComponent;
  let fixture: ComponentFixture<CodLabelCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodLabelCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodLabelCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

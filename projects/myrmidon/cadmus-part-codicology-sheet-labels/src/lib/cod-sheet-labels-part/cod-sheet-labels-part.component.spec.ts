import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodSheetLabelsPartComponent } from './cod-sheet-labels-part.component';

describe('CodSheetLabelsPartComponent', () => {
  let component: CodSheetLabelsPartComponent;
  let fixture: ComponentFixture<CodSheetLabelsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodSheetLabelsPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodSheetLabelsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

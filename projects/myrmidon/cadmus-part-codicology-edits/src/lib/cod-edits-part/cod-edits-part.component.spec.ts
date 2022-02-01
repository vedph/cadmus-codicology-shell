import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodEditsPartComponent } from './cod-edits-part.component';

describe('CodEditsPartComponent', () => {
  let component: CodEditsPartComponent;
  let fixture: ComponentFixture<CodEditsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodEditsPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodEditsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

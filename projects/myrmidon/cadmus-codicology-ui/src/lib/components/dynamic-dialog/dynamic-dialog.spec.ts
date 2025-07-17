import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicDialog } from './dynamic-dialog';

describe('DynamicDialog', () => {
  let component: DynamicDialog;
  let fixture: ComponentFixture<DynamicDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

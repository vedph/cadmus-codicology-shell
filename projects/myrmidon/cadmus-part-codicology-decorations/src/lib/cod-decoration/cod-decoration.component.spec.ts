import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodDecorationComponent } from './cod-decoration.component';

describe('CodDecorationComponent', () => {
  let component: CodDecorationComponent;
  let fixture: ComponentFixture<CodDecorationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodDecorationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodDecorationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

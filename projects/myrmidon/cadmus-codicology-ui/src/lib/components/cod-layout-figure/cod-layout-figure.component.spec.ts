import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodLayoutFigureComponent } from './cod-layout-figure.component';

describe('CodLayoutFigureComponent', () => {
  let component: CodLayoutFigureComponent;
  let fixture: ComponentFixture<CodLayoutFigureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodLayoutFigureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodLayoutFigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

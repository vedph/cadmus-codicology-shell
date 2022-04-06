import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodLocationConverterComponent } from './cod-location-converter.component';

describe('CodLocationConverterComponent', () => {
  let component: CodLocationConverterComponent;
  let fixture: ComponentFixture<CodLocationConverterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodLocationConverterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodLocationConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodLayoutFormula } from './cod-layout-formula';

describe('CodLayoutFormula', () => {
  let component: CodLayoutFormula;
  let fixture: ComponentFixture<CodLayoutFormula>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodLayoutFormula]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodLayoutFormula);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaDemoPage } from './formula-demo-page';

describe('FormulaDemoPage', () => {
  let component: FormulaDemoPage;
  let fixture: ComponentFixture<FormulaDemoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaDemoPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaDemoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

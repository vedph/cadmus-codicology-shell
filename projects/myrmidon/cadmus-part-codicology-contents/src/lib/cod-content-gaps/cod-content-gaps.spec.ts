import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodContentGapsComponent } from './cod-content-gaps.component';

describe('CodContentGapsComponent', () => {
  let component: CodContentGapsComponent;
  let fixture: ComponentFixture<CodContentGapsComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodContentGapsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodContentGapsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

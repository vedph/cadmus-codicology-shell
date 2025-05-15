import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodQuireDescriptionComponent } from './cod-quire-description.component';

describe('CodQuireDescriptionComponent', () => {
  let component: CodQuireDescriptionComponent;
  let fixture: ComponentFixture<CodQuireDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodQuireDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodQuireDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

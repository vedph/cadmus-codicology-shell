import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodIllumInstructionsPartComponent } from './cod-illum-instructions-part.component';

describe('CodIllumInstructionsPartComponent', () => {
  let component: CodIllumInstructionsPartComponent;
  let fixture: ComponentFixture<CodIllumInstructionsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodIllumInstructionsPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodIllumInstructionsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

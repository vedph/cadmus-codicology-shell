import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { CodLayoutsPartComponent } from './cod-layouts-part.component';

describe('CodLayoutsPartComponent', () => {
  let component: CodLayoutsPartComponent;
  let fixture: ComponentFixture<CodLayoutsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        CodLayoutsPartComponent
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodLayoutsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

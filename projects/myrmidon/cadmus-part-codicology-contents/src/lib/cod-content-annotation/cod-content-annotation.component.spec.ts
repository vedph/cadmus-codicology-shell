import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodContentAnnotationComponent } from './cod-content-annotation.component';

describe('CodContentAnnotationComponent', () => {
  let component: CodContentAnnotationComponent;
  let fixture: ComponentFixture<CodContentAnnotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodContentAnnotationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodContentAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

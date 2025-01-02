import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodDecorationElementComponent } from './cod-decoration-element.component';

describe('CodDecorationElementComponent', () => {
  let component: CodDecorationElementComponent;
  let fixture: ComponentFixture<CodDecorationElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodDecorationElementComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodDecorationElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

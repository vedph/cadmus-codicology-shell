import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodHandComponent } from './cod-hand.component';

describe('CodHandComponent', () => {
  let component: CodHandComponent;
  let fixture: ComponentFixture<CodHandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodHandComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

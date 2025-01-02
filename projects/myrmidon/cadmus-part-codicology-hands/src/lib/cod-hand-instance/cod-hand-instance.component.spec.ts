import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodHandInstanceComponent } from './cod-hand-instance.component';

describe('CodHandInstanceComponent', () => {
  let component: CodHandInstanceComponent;
  let fixture: ComponentFixture<CodHandInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodHandInstanceComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodHandInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodHandSignComponent } from './cod-hand-sign.component';

describe('CodHandSignComponent', () => {
  let component: CodHandSignComponent;
  let fixture: ComponentFixture<CodHandSignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodHandSignComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodHandSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

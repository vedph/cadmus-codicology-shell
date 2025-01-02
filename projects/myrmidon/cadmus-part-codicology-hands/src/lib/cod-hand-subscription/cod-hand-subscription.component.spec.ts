import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodHandSubscriptionComponent } from './cod-hand-subscription.component';

describe('CodHandSubscriptionComponent', () => {
  let component: CodHandSubscriptionComponent;
  let fixture: ComponentFixture<CodHandSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodHandSubscriptionComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodHandSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

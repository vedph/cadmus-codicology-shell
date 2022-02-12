import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodHandsPartComponent } from './cod-hands-part.component';

describe('CodHandsComponent', () => {
  let component: CodHandsPartComponent;
  let fixture: ComponentFixture<CodHandsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodHandsPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodHandsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

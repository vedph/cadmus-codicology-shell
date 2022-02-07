import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodHandDescriptionComponent } from './cod-hand-description.component';

describe('CodHandDescriptionComponent', () => {
  let component: CodHandDescriptionComponent;
  let fixture: ComponentFixture<CodHandDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodHandDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodHandDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

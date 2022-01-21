import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodBindingsPartComponent } from './cod-bindings-part.component';

describe('CodBindingsPartComponent', () => {
  let component: CodBindingsPartComponent;
  let fixture: ComponentFixture<CodBindingsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodBindingsPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodBindingsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodEndleafComponent } from './cod-endleaf.component';

describe('CodEndleafComponent', () => {
  let component: CodEndleafComponent;
  let fixture: ComponentFixture<CodEndleafComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodEndleafComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodEndleafComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

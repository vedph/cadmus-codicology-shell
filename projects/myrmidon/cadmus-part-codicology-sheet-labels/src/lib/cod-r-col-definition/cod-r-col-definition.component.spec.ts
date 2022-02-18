import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodRColDefinitionComponent } from './cod-r-col-definition.component';

describe('CodRColDefinitionComponent', () => {
  let component: CodRColDefinitionComponent;
  let fixture: ComponentFixture<CodRColDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodRColDefinitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodRColDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

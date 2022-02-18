import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodNColDefinitionComponent } from './cod-n-col-definition.component';

describe('CodNColDefinitionComponent', () => {
  let component: CodNColDefinitionComponent;
  let fixture: ComponentFixture<CodNColDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodNColDefinitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodNColDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodCColDefinitionComponent } from './cod-c-col-definition.component';

describe('CodCColDefinitionComponent', () => {
  let component: CodCColDefinitionComponent;
  let fixture: ComponentFixture<CodCColDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodCColDefinitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodCColDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodSColDefinitionComponent } from './cod-s-col-definition.component';

describe('CodSColDefinitionComponent', () => {
  let component: CodSColDefinitionComponent;
  let fixture: ComponentFixture<CodSColDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodSColDefinitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodSColDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodBindingEditorComponent } from './cod-binding-editor.component';

describe('CodBindingEditorComponent', () => {
  let component: CodBindingEditorComponent;
  let fixture: ComponentFixture<CodBindingEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodBindingEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodBindingEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

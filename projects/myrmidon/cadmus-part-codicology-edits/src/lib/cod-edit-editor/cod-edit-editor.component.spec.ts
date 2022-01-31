import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodEditEditorComponent } from './cod-edit-editor.component';

describe('CodEditEditorComponent', () => {
  let component: CodEditEditorComponent;
  let fixture: ComponentFixture<CodEditEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodEditEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodEditEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

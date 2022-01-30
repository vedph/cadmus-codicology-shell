import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodContentEditorComponent } from './cod-content-editor.component';

describe('CodContentEditorComponent', () => {
  let component: CodContentEditorComponent;
  let fixture: ComponentFixture<CodContentEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodContentEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodContentEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

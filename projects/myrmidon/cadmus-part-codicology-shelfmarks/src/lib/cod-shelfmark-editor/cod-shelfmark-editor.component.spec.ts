import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodShelfmarkEditorComponent } from './cod-shelfmark-editor.component';

describe('CodShelfmarkEditorComponent', () => {
  let component: CodShelfmarkEditorComponent;
  let fixture: ComponentFixture<CodShelfmarkEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodShelfmarkEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodShelfmarkEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

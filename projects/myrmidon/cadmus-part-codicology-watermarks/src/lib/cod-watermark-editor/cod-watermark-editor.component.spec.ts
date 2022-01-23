import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodWatermarkEditorComponent } from './cod-watermark-editor.component';

describe('CodWatermarkEditorComponent', () => {
  let component: CodWatermarkEditorComponent;
  let fixture: ComponentFixture<CodWatermarkEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodWatermarkEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodWatermarkEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodOrdinalEditor } from './cod-ordinal-editor';

describe('CodOrdinalEditor', () => {
  let component: CodOrdinalEditor;
  let fixture: ComponentFixture<CodOrdinalEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodOrdinalEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodOrdinalEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

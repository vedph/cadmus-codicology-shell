import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodPalimpsestEditorComponent } from './cod-palimpsest-editor.component';

describe('CodPalimpsestEditorComponent', () => {
  let component: CodPalimpsestEditorComponent;
  let fixture: ComponentFixture<CodPalimpsestEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodPalimpsestEditorComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodPalimpsestEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

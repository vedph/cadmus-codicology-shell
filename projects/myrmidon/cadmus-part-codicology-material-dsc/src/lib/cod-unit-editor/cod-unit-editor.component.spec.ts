import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodUnitEditorComponent } from './cod-unit-editor.component';

describe('CodUnitEditorComponent', () => {
  let component: CodUnitEditorComponent;
  let fixture: ComponentFixture<CodUnitEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodUnitEditorComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodUnitEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

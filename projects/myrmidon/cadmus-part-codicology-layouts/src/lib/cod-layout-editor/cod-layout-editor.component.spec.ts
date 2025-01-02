import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { CodLayoutEditorComponent } from './cod-layout-editor.component';

describe('CodLayoutEditorComponent', () => {
  let component: CodLayoutEditorComponent;
  let fixture: ComponentFixture<CodLayoutEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        CodLayoutEditorComponent
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodLayoutEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

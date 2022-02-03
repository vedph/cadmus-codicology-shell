import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextOrEntrySelectorComponent } from './text-or-entry-selector.component';

describe('TextOrEntrySelectorComponent', () => {
  let component: TextOrEntrySelectorComponent;
  let fixture: ComponentFixture<TextOrEntrySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextOrEntrySelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextOrEntrySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

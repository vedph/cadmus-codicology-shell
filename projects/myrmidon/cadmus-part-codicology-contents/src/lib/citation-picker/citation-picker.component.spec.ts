import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitationPicker } from './citation-picker';

describe('CitationPicker', () => {
  let component: CitationPicker;
  let fixture: ComponentFixture<CitationPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitationPicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitationPicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

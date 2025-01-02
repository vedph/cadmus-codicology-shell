import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodContentsPartComponent } from './cod-contents-part.component';

describe('CodContentsPartComponent', () => {
  let component: CodContentsPartComponent;
  let fixture: ComponentFixture<CodContentsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodContentsPartComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodContentsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

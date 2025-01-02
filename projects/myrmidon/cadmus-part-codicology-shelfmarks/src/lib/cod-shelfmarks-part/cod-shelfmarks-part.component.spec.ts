import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodShelfmarksPartComponent } from './cod-shelfmarks-part.component';

describe('CodShelfmarksPartComponent', () => {
  let component: CodShelfmarksPartComponent;
  let fixture: ComponentFixture<CodShelfmarksPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodShelfmarksPartComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodShelfmarksPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

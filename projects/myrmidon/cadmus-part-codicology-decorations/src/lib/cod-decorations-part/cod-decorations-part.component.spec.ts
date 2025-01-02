import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodDecorationsPartComponent } from './cod-decorations-part.component';

describe('CodDecorationsPartComponent', () => {
  let component: CodDecorationsPartComponent;
  let fixture: ComponentFixture<CodDecorationsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodDecorationsPartComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodDecorationsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodShelfmarksPartFeatureComponent } from './cod-shelfmarks-part-feature.component';

describe('CodShelfmarksPartFeatureComponent', () => {
  let component: CodShelfmarksPartFeatureComponent;
  let fixture: ComponentFixture<CodShelfmarksPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodShelfmarksPartFeatureComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodShelfmarksPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodMaterialDscPartFeatureComponent } from './cod-material-dsc-part-feature.component';

describe('CodMaterialDscPartFeatureComponent', () => {
  let component: CodMaterialDscPartFeatureComponent;
  let fixture: ComponentFixture<CodMaterialDscPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodMaterialDscPartFeatureComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodMaterialDscPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

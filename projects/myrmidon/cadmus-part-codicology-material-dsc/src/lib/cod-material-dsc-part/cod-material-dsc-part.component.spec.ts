import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodMaterialDscPartComponent } from './cod-material-dsc-part.component';

describe('CodMaterialDscPartComponent', () => {
  let component: CodMaterialDscPartComponent;
  let fixture: ComponentFixture<CodMaterialDscPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodMaterialDscPartComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodMaterialDscPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

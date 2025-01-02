import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodBindingsPartFeatureComponent } from './cod-bindings-part-feature.component';

describe('CodBindingsPartFeatureComponent', () => {
  let component: CodBindingsPartFeatureComponent;
  let fixture: ComponentFixture<CodBindingsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodBindingsPartFeatureComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodBindingsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

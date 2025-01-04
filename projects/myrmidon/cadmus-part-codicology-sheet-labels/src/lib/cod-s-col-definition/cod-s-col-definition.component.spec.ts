import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CloseSaveButtonsComponent } from '@myrmidon/cadmus-ui';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { CodSColDefinitionComponent } from './cod-s-col-definition.component';

describe('CodSColDefinitionComponent', () => {
  let component: CodSColDefinitionComponent;
  let fixture: ComponentFixture<CodSColDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        // material
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTabsModule,
        MatTooltipModule,
        // Cadmus
        CloseSaveButtonsComponent,
        CurrentItemBarComponent,
        CodSColDefinitionComponent,
    ],
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodSColDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

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
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { CodLabelCellComponent } from './cod-label-cell.component';

describe('CodLabelCellComponent', () => {
  let component: CodLabelCellComponent;
  let fixture: ComponentFixture<CodLabelCellComponent>;

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
        CadmusStateModule,
        CadmusUiModule,
        CadmusUiPgModule,
        CadmusMatPhysicalSizeModule,
        CadmusRefsAssertedChronotopeModule,
        CadmusRefsHistoricalDateModule,
        CadmusUiFlagsPickerModule,
        CodLabelCellComponent,
    ],
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodLabelCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

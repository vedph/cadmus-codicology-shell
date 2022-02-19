import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgToolsModule } from '@myrmidon/ng-tools';
import { CadmusMatPhysicalSizeModule } from '@myrmidon/cadmus-mat-physical-size';
import { CadmusRefsAssertedChronotopeModule } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { CadmusRefsHistoricalDateModule } from '@myrmidon/cadmus-refs-historical-date';
import { CadmusUiFlagsPickerModule } from '@myrmidon/cadmus-ui-flags-picker';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { CodNColDefinitionComponent } from './cod-n-col-definition/cod-n-col-definition.component';
import { CodCColDefinitionComponent } from './cod-c-col-definition/cod-c-col-definition.component';
import { CodSColDefinitionComponent } from './cod-s-col-definition/cod-s-col-definition.component';
import { CodRColDefinitionComponent } from './cod-r-col-definition/cod-r-col-definition.component';
import { CodEndleafComponent } from './cod-endleaf/cod-endleaf.component';

@NgModule({
  declarations: [
    CodNColDefinitionComponent,
    CodCColDefinitionComponent,
    CodSColDefinitionComponent,
    CodRColDefinitionComponent,
    CodEndleafComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    NgToolsModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusMatPhysicalSizeModule,
    CadmusRefsAssertedChronotopeModule,
    CadmusRefsHistoricalDateModule,
    CadmusUiFlagsPickerModule,
  ],
  exports: [
    CodNColDefinitionComponent,
    CodCColDefinitionComponent,
    CodSColDefinitionComponent,
    CodRColDefinitionComponent,
    CodEndleafComponent
  ],
})
export class CadmusPartCodicologySheetLabelsModule {}

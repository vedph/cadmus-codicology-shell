import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgToolsModule } from '@myrmidon/ng-tools';
import { CadmusCodLocationModule } from '@myrmidon/cadmus-cod-location';
import { CadmusMatPhysicalSizeModule } from '@myrmidon/cadmus-mat-physical-size';
import { CadmusRefsAssertedChronotopeModule } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { CadmusRefsDecoratedCountsModule } from '@myrmidon/cadmus-refs-decorated-counts';
import { CadmusRefsHistoricalDateModule } from '@myrmidon/cadmus-refs-historical-date';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';

import { CodLayoutEditorComponent } from './cod-layout-editor/cod-layout-editor.component';
import { CodLayoutsPartComponent } from './cod-layouts-part/cod-layouts-part.component';
import { CodLayoutsPartFeatureComponent } from './cod-layouts-part-feature/cod-layouts-part-feature.component';

@NgModule({
  declarations: [
    CodLayoutEditorComponent,
    CodLayoutsPartComponent,
    CodLayoutsPartFeatureComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // material
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatTabsModule,
    MatTooltipModule,
    // Cadmus
    NgToolsModule,
    CadmusCodicologyUiModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusMatPhysicalSizeModule,
    CadmusRefsAssertedChronotopeModule,
    CadmusRefsDecoratedCountsModule,
    CadmusRefsHistoricalDateModule,
    CadmusCodLocationModule,
  ],
  exports: [
    CodLayoutEditorComponent,
    CodLayoutsPartComponent,
    CodLayoutsPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyLayoutsModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// cadmus
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
// bricks
import { CadmusCodLocationModule } from '@myrmidon/cadmus-cod-location';
import { CadmusMatPhysicalSizeModule } from '@myrmidon/cadmus-mat-physical-size';
import { CadmusRefsAssertedChronotopeModule } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { CadmusRefsExternalIdsModule } from '@myrmidon/cadmus-refs-external-ids';
import { CadmusRefsHistoricalDateModule } from '@myrmidon/cadmus-refs-historical-date';

import { CodWatermarksPartComponent } from './cod-watermarks-part/cod-watermarks-part.component';
import { CodWatermarkEditorComponent } from './cod-watermark-editor/cod-watermark-editor.component';
import { CodWatermarksPartFeatureComponent } from './cod-watermarks-part-feature/cod-watermarks-part-feature.component';

@NgModule({
  declarations: [
    CodWatermarksPartComponent,
    CodWatermarkEditorComponent,
    CodWatermarksPartFeatureComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // material
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    // Cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusCodLocationModule,
    CadmusMatPhysicalSizeModule,
    CadmusRefsAssertedChronotopeModule,
    CadmusRefsExternalIdsModule,
    CadmusRefsHistoricalDateModule,
  ],
  exports: [
    CodWatermarksPartComponent,
    CodWatermarkEditorComponent,
    CodWatermarksPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyWatermarksModule {}

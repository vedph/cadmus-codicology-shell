import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// bricks
import {
  CodLocationComponent,
  CodLocationPipe,
  CodLocationRangePipe,
} from '@myrmidon/cadmus-cod-location';
import { PhysicalSizeComponent } from '@myrmidon/cadmus-mat-physical-size';
import {
  AssertedChronotopeComponent,
  AssertedChronotopeSetComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import {
  AssertedCompositeIdComponent,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { HistoricalDateComponent } from '@myrmidon/cadmus-refs-historical-date';

// cadmus
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

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
    CodLocationComponent,
    CodLocationPipe,
    CodLocationRangePipe,
    PhysicalSizeComponent,
    AssertedChronotopeComponent,
    AssertedChronotopeSetComponent,
    AssertedCompositeIdComponent,
    AssertedCompositeIdsComponent,
    HistoricalDateComponent,
  ],
  exports: [
    CodWatermarksPartComponent,
    CodWatermarkEditorComponent,
    CodWatermarksPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyWatermarksModule {}

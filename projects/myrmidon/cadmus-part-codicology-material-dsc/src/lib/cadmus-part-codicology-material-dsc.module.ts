import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
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
import {
  AssertedChronotopeComponent,
  AssertedChronotopeSetComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import {
  HistoricalDateComponent,
  HistoricalDatePipe,
} from '@myrmidon/cadmus-refs-historical-date';

import { FlatLookupPipe } from '@myrmidon/ngx-tools';

// cadmus
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { CodMaterialDscPartComponent } from './cod-material-dsc-part/cod-material-dsc-part.component';
import { CodUnitEditorComponent } from './cod-unit-editor/cod-unit-editor.component';
import { CodPalimpsestEditorComponent } from './cod-palimpsest-editor/cod-palimpsest-editor.component';
import { CodMaterialDscPartFeatureComponent } from './cod-material-dsc-part-feature/cod-material-dsc-part-feature.component';

@NgModule({
  declarations: [
    CodMaterialDscPartComponent,
    CodUnitEditorComponent,
    CodPalimpsestEditorComponent,
    CodMaterialDscPartFeatureComponent,
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
    MatTabsModule,
    MatTooltipModule,
    FlatLookupPipe,
    // Cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    AssertedChronotopeComponent,
    AssertedChronotopeSetComponent,
    HistoricalDateComponent,
    HistoricalDatePipe,
    CodLocationComponent,
    CodLocationPipe,
    CodLocationRangePipe,
  ],
  exports: [
    CodMaterialDscPartComponent,
    CodUnitEditorComponent,
    CodPalimpsestEditorComponent,
    CodMaterialDscPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyMaterialDscModule {}

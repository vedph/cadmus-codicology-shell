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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NgToolsModule } from '@myrmidon/ng-tools';
import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';
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
import { CodSheetLabelsPartComponent } from './cod-sheet-labels-part/cod-sheet-labels-part.component';
import { CodLabelCellComponent } from './cod-label-cell/cod-label-cell.component';
import { CodSheetLabelsPartFeatureComponent } from './cod-sheet-labels-part-feature/cod-sheet-labels-part-feature.component';
import { CellAdapterPipe } from './cod-sheet-labels-part/cell-adapter.pipe';
import { CellTypeColorPipe } from './cod-sheet-labels-part/cell-type-color.pipe';
import { CodLocationConverterComponent } from './cod-location-converter/cod-location-converter.component';

@NgModule({
  declarations: [
    CodCColDefinitionComponent,
    CodEndleafComponent,
    CodLabelCellComponent,
    CodLocationConverterComponent,
    CodNColDefinitionComponent,
    CodSColDefinitionComponent,
    CodRColDefinitionComponent,
    CodSheetLabelsPartComponent,
    CodSheetLabelsPartFeatureComponent,
    CellAdapterPipe,
    CellTypeColorPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // material
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    // Cadmus
    NgToolsModule,
    NgMatToolsModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusMatPhysicalSizeModule,
    CadmusRefsAssertedChronotopeModule,
    CadmusRefsHistoricalDateModule,
    CadmusUiFlagsPickerModule,
  ],
  exports: [
    CodCColDefinitionComponent,
    CodEndleafComponent,
    CodLabelCellComponent,
    CodLocationConverterComponent,
    CodNColDefinitionComponent,
    CodRColDefinitionComponent,
    CodSColDefinitionComponent,
    CodSheetLabelsPartComponent,
    CodSheetLabelsPartFeatureComponent,
  ],
})
export class CadmusPartCodicologySheetLabelsModule {}

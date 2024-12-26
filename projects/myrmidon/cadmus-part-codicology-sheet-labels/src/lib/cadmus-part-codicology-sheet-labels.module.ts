import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FlatLookupPipe } from '@myrmidon/ngx-tools';

// bricks
import { PhysicalSizeComponent } from '@myrmidon/cadmus-mat-physical-size';
import { AssertedChronotopeComponent } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { HistoricalDateComponent } from '@myrmidon/cadmus-refs-historical-date';
import { RefLookupComponent } from '@myrmidon/cadmus-refs-lookup';
import { FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

// cadmus
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';

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
    ClipboardModule,
    // material
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
    FlatLookupPipe,
    // Cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    PhysicalSizeComponent,
    AssertedChronotopeComponent,
    HistoricalDateComponent,
    FlagSetComponent,
    RefLookupComponent,
    CadmusCodicologyUiModule,
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

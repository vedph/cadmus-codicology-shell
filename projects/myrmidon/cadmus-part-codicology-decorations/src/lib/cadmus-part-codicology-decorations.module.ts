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

// vendor
import { NgeMonacoModule } from '@cisstech/nge/monaco';

// myrmidon
import { FlatLookupPipe } from '@myrmidon/ngx-tools';

// bricks
import { AssertionComponent } from '@myrmidon/cadmus-refs-assertion';
import {
  PhysicalSizeComponent,
  PhysicalSizePipe,
} from '@myrmidon/cadmus-mat-physical-size';
import {
  AssertedChronotopeComponent,
  AssertedChronotopeSetComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import {
  AssertedCompositeIdComponent,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { DocReferencesComponent } from '@myrmidon/cadmus-refs-doc-references';
import { HistoricalDateComponent } from '@myrmidon/cadmus-refs-historical-date';
import {
  CodLocationComponent,
  CodLocationRangePipe,
} from '@myrmidon/cadmus-cod-location';
import { FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

// cadmus
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';

import { CodDecorationElementComponent } from './cod-decoration-element/cod-decoration-element.component';
import { TextOrEntrySelectorComponent } from './text-or-entry-selector/text-or-entry-selector.component';
import { CodDecorationArtistStyleComponent } from './cod-decoration-artist-style/cod-decoration-artist-style.component';
import { CodDecorationArtistComponent } from './cod-decoration-artist/cod-decoration-artist.component';
import { CodDecorationComponent } from './cod-decoration/cod-decoration.component';
import { CodDecorationsPartComponent } from './cod-decorations-part/cod-decorations-part.component';
import { CodDecorationsPartFeatureComponent } from './cod-decorations-part-feature/cod-decorations-part-feature.component';

@NgModule({
  declarations: [
    CodDecorationElementComponent,
    TextOrEntrySelectorComponent,
    CodDecorationArtistStyleComponent,
    CodDecorationArtistComponent,
    CodDecorationComponent,
    CodDecorationsPartComponent,
    CodDecorationsPartFeatureComponent,
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
    // vendor
    NgeMonacoModule,
    // bricks
    PhysicalSizeComponent,
    PhysicalSizePipe,
    AssertedChronotopeComponent,
    AssertedChronotopeSetComponent,
    AssertedCompositeIdComponent,
    AssertedCompositeIdsComponent,
    AssertionComponent,
    DocReferencesComponent,
    HistoricalDateComponent,
    FlagSetComponent,
    CodLocationComponent,
    CodLocationRangePipe,
    FlatLookupPipe,
    // cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusCodicologyUiModule,
  ],
  exports: [
    CodDecorationElementComponent,
    TextOrEntrySelectorComponent,
    CodDecorationArtistStyleComponent,
    CodDecorationArtistComponent,
    CodDecorationComponent,
    CodDecorationsPartComponent,
    CodDecorationsPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyDecorationsModule {}

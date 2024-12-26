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

import { FlatLookupPipe } from '@myrmidon/ngx-tools';

// bricks
import {
  CodLocationComponent,
  CodLocationPipe,
  CodLocationRangePipe,
} from '@myrmidon/cadmus-cod-location';
import { PhysicalSizeComponent } from '@myrmidon/cadmus-mat-physical-size';
import { AssertedChronotopeComponent } from '@myrmidon/cadmus-refs-asserted-chronotope';
import {
  AssertedCompositeIdComponent,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { DocReferencesComponent } from '@myrmidon/cadmus-refs-doc-references';
import { HistoricalDateComponent } from '@myrmidon/cadmus-refs-historical-date';
import { NoteSetComponent } from '@myrmidon/cadmus-ui-note-set';
import { FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

// cadmus
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';

import { CodHandSubscriptionComponent } from './cod-hand-subscription/cod-hand-subscription.component';
import { CodHandSignComponent } from './cod-hand-sign/cod-hand-sign.component';
import { CodHandDescriptionComponent } from './cod-hand-description/cod-hand-description.component';
import { CodHandInstanceComponent } from './cod-hand-instance/cod-hand-instance.component';
import { CodHandComponent } from './cod-hand/cod-hand.component';
import { CodHandsPartComponent } from './cod-hands-part/cod-hands-part.component';
import { CodHandsPartFeatureComponent } from './cod-hands-part-feature/cod-hands-part-feature.component';

@NgModule({
  declarations: [
    CodHandSubscriptionComponent,
    CodHandSignComponent,
    CodHandDescriptionComponent,
    CodHandInstanceComponent,
    CodHandComponent,
    CodHandsPartComponent,
    CodHandsPartFeatureComponent,
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
    // myrmidon
    // bricks
    NoteSetComponent,
    CodLocationComponent,
    CodLocationPipe,
    CodLocationRangePipe,
    PhysicalSizeComponent,
    AssertedChronotopeComponent,
    AssertedCompositeIdComponent,
    AssertedCompositeIdsComponent,
    DocReferencesComponent,
    HistoricalDateComponent,
    FlagSetComponent,
    // cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusCodicologyUiModule,
  ],
  exports: [
    CodHandSubscriptionComponent,
    CodHandSignComponent,
    CodHandDescriptionComponent,
    CodHandInstanceComponent,
    CodHandComponent,
    CodHandsPartComponent,
    CodHandsPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyHandsModule {}

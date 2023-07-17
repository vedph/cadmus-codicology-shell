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

import { NgToolsModule } from '@myrmidon/ng-tools';
import { CadmusCodLocationModule } from '@myrmidon/cadmus-cod-location';
import { CadmusMatPhysicalSizeModule } from '@myrmidon/cadmus-mat-physical-size';
import { CadmusRefsAssertedChronotopeModule } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { CadmusRefsAssertedIdsModule } from '@myrmidon/cadmus-refs-asserted-ids';
import { CadmusRefsDocReferencesModule } from '@myrmidon/cadmus-refs-doc-references';
import { CadmusRefsHistoricalDateModule } from '@myrmidon/cadmus-refs-historical-date';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';
import { CadmusUiFlagsPickerModule } from '@myrmidon/cadmus-ui-flags-picker';
import { CadmusUiNoteSetModule } from '@myrmidon/cadmus-ui-note-set';

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
    // Cadmus
    NgToolsModule,
    CadmusUiNoteSetModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusCodLocationModule,
    CadmusMatPhysicalSizeModule,
    CadmusRefsAssertedChronotopeModule,
    CadmusRefsAssertedIdsModule,
    CadmusRefsDocReferencesModule,
    CadmusRefsHistoricalDateModule,
    CadmusCodicologyUiModule,
    CadmusUiFlagsPickerModule
  ],
  exports: [
    CodHandSubscriptionComponent,
    CodHandSignComponent,
    CodHandDescriptionComponent,
    CodHandInstanceComponent,
    CodHandComponent,
    CodHandsPartComponent,
    CodHandsPartFeatureComponent
  ],
})
export class CadmusPartCodicologyHandsModule {}

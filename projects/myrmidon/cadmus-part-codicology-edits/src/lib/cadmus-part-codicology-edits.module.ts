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

import { EllipsisPipe, FlatLookupPipe } from '@myrmidon/ngx-tools';

// bricks
import { CodLocationComponent, CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';
import {
  AssertedCompositeIdComponent,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { DocReferencesComponent } from '@myrmidon/cadmus-refs-doc-references';
import { HistoricalDateComponent } from '@myrmidon/cadmus-refs-historical-date';
import { FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

// cadmus
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { CodEditEditorComponent } from './cod-edit-editor/cod-edit-editor.component';
import { CodEditsPartComponent } from './cod-edits-part/cod-edits-part.component';
import { CodEditsPartFeatureComponent } from './cod-edits-part-feature/cod-edits-part-feature.component';

@NgModule({
  declarations: [
    CodEditEditorComponent,
    CodEditsPartComponent,
    CodEditsPartFeatureComponent,
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
    // myrmidon
    EllipsisPipe,
    FlatLookupPipe,
    // bricks
    CodLocationComponent,
    CodLocationRangePipe,
    AssertedCompositeIdComponent,
    AssertedCompositeIdsComponent,
    DocReferencesComponent,
    HistoricalDateComponent,
    FlagSetComponent,
    // cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
  ],
  exports: [
    CodEditEditorComponent,
    CodEditsPartComponent,
    CodEditsPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyEditsModule {}

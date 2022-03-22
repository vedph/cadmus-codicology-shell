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

import { NgToolsModule } from '@myrmidon/ng-tools';
import { CadmusCodLocationModule } from '@myrmidon/cadmus-cod-location';
import { CadmusRefsDocReferencesModule } from '@myrmidon/cadmus-refs-doc-references';
import { CadmusRefsHistoricalDateModule } from '@myrmidon/cadmus-refs-historical-date';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiFlagsPickerModule } from '@myrmidon/cadmus-ui-flags-picker';
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
    // Cadmus
    NgToolsModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusCodLocationModule,
    CadmusRefsDocReferencesModule,
    CadmusRefsHistoricalDateModule,
    CadmusUiFlagsPickerModule,
  ],
  exports: [
    CodEditEditorComponent,
    CodEditsPartComponent,
    CodEditsPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyEditsModule {}

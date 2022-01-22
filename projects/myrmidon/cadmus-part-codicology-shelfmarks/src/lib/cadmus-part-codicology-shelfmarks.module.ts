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
// locals (UI editor and PG wrapper)
import { CodShelfmarksPartComponent } from './cod-shelfmarks-part/cod-shelfmarks-part.component';
import { CodShelfmarkEditorComponent } from './cod-shelfmark-editor/cod-shelfmark-editor.component';
import { CodShelfmarksPartFeatureComponent } from './cod-shelfmarks-part-feature/cod-shelfmarks-part-feature.component';

@NgModule({
  declarations: [
    CodShelfmarksPartComponent,
    CodShelfmarkEditorComponent,
    CodShelfmarksPartFeatureComponent,
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
  ],
  exports: [
    CodShelfmarksPartComponent,
    CodShelfmarkEditorComponent,
    CodShelfmarksPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyShelfmarksModule {}

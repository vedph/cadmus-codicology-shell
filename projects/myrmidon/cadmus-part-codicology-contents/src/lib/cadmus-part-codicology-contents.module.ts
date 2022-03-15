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

import { CadmusCodLocationModule } from '@myrmidon/cadmus-cod-location';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiFlagsPickerModule } from '@myrmidon/cadmus-ui-flags-picker';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';

import { CodContentEditorComponent } from './cod-content-editor/cod-content-editor.component';
import { CodContentsPartComponent } from './cod-contents-part/cod-contents-part.component';
import { CodContentsPartFeatureComponent } from './cod-contents-part-feature/cod-contents-part-feature.component';
import { CodContentAnnotationComponent } from './cod-content-annotation/cod-content-annotation.component';

@NgModule({
  declarations: [
    CodContentEditorComponent,
    CodContentsPartComponent,
    CodContentsPartFeatureComponent,
    CodContentAnnotationComponent,
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
    NgMatToolsModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusCodLocationModule,
    CadmusUiFlagsPickerModule,
  ],
  exports: [
    CodContentEditorComponent,
    CodContentsPartComponent,
    CodContentsPartFeatureComponent,
    CodContentAnnotationComponent
  ],
})
export class CadmusPartCodicologyContentsModule {}

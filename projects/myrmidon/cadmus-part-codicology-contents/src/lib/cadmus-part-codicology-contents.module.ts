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

// bricks
import {
  CodLocationComponent,
  CodLocationPipe,
  CodLocationRangePipe,
} from '@myrmidon/cadmus-cod-location';
import {
  AssertedCompositeIdComponent,
  AssertedCompositeIdsComponent,
  AssertedIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { FlagsPickerComponent } from '@myrmidon/cadmus-ui-flags-picker';
import { EllipsisPipe, FlatLookupPipe } from '@myrmidon/ngx-tools';

// cadmus
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

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
    // myrmidon
    EllipsisPipe,
    FlatLookupPipe,
    // Cadmus
    AssertedIdsComponent,
    AssertedCompositeIdComponent,
    AssertedCompositeIdsComponent,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CodLocationComponent,
    CodLocationPipe,
    CodLocationRangePipe,
    FlagsPickerComponent,
  ],
  exports: [
    CodContentEditorComponent,
    CodContentsPartComponent,
    CodContentsPartFeatureComponent,
    CodContentAnnotationComponent,
  ],
})
export class CadmusPartCodicologyContentsModule {}

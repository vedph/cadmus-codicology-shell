import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// myrmidon
import { NgToolsModule } from '@myrmidon/ng-tools';
// bricks
import {
  PhysicalSizeComponent,
  PhysicalSizePipe,
} from '@myrmidon/cadmus-mat-physical-size';
import { AssertedChronotopeComponent } from '@myrmidon/cadmus-refs-asserted-chronotope';
import {
  HistoricalDateComponent,
  HistoricalDatePipe,
} from '@myrmidon/cadmus-refs-historical-date';
// cadmus
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
// locals
import { CodBindingsPartComponent } from './cod-bindings-part/cod-bindings-part.component';
import { CodBindingEditorComponent } from './cod-binding-editor/cod-binding-editor.component';
import { CodBindingsPartFeatureComponent } from './cod-bindings-part-feature/cod-bindings-part-feature.component';

@NgModule({
  declarations: [
    CodBindingsPartComponent,
    CodBindingEditorComponent,
    CodBindingsPartFeatureComponent,
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
    NgToolsModule,
    // cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    PhysicalSizeComponent,
    PhysicalSizePipe,
    AssertedChronotopeComponent,
    HistoricalDateComponent,
    HistoricalDatePipe,
  ],
  exports: [
    CodBindingsPartComponent,
    CodBindingEditorComponent,
    CodBindingsPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyBindingsModule {}

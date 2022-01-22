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

import { CadmusMatPhysicalSizeModule } from '@myrmidon/cadmus-mat-physical-size';
import { CadmusRefsAssertedChronotopeModule } from '@myrmidon/cadmus-refs-asserted-chronotope';

// general Cadmus modules
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CodBindingsPartComponent } from './cod-bindings-part/cod-bindings-part.component';
import { CodBindingEditorComponent } from './cod-binding-editor/cod-binding-editor.component';
import { CadmusRefsHistoricalDateModule } from '@myrmidon/cadmus-refs-historical-date';

@NgModule({
  declarations: [
    CodBindingsPartComponent,
    CodBindingEditorComponent
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
    CadmusUiModule,
    CadmusRefsAssertedChronotopeModule,
    CadmusRefsHistoricalDateModule,
    CadmusMatPhysicalSizeModule
  ],
  exports: [
    CodBindingsPartComponent,
    CodBindingEditorComponent
  ],
})
export class CadmusPartCodicologyBindingsModule {}

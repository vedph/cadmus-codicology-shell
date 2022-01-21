import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CadmusMatPhysicalSizeModule } from '@myrmidon/cadmus-mat-physical-size';
import { CadmusRefsAssertedChronotopeModule } from '@myrmidon/cadmus-refs-asserted-chronotope';

// general Cadmus modules
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CodBindingsPartComponent } from './cod-bindings-part/cod-bindings-part.component';

@NgModule({
  declarations: [
    CodBindingsPartComponent
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
    MatTabsModule,
    MatTooltipModule,
    // Cadmus
    CadmusUiModule,
    CadmusRefsAssertedChronotopeModule,
    CadmusMatPhysicalSizeModule
  ],
  exports: [
    CodBindingsPartComponent
  ],
})
export class CadmusPartCodicologyBindingsModule {}

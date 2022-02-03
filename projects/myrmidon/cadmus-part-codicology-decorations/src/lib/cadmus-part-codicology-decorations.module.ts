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

import { MonacoEditorModule } from 'ngx-monaco-editor';

import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';
import { CadmusMatPhysicalSizeModule } from '@myrmidon/cadmus-mat-physical-size';
import { CadmusRefsAssertedChronotopeModule } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { CadmusRefsHistoricalDateModule } from '@myrmidon/cadmus-refs-historical-date';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusCodLocationModule } from '@myrmidon/cadmus-cod-location';
import { CadmusUiFlagsPickerModule } from '@myrmidon/cadmus-ui-flags-picker';

import { CodDecorationElementComponent } from './cod-decoration-element/cod-decoration-element.component';
import { TextOrEntrySelectorComponent } from './text-or-entry-selector/text-or-entry-selector.component';

@NgModule({
  declarations: [CodDecorationElementComponent, TextOrEntrySelectorComponent],
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
    // monaco
    MonacoEditorModule,
    // cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusMatPhysicalSizeModule,
    CadmusRefsAssertedChronotopeModule,
    CadmusRefsHistoricalDateModule,
    CadmusUiFlagsPickerModule,
    CadmusCodLocationModule,
    CadmusCodicologyUiModule,
  ],
  exports: [CodDecorationElementComponent, TextOrEntrySelectorComponent],
})
export class CadmusPartCodicologyDecorationsModule {}

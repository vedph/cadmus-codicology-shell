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

import { MonacoEditorModule } from 'ngx-monaco-editor';

import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';
import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';
import { CadmusMatPhysicalSizeModule } from '@myrmidon/cadmus-mat-physical-size';
import { CadmusRefsAssertionModule } from '@myrmidon/cadmus-refs-assertion';
import { CadmusRefsAssertedChronotopeModule } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { CadmusRefsExternalIdsModule } from '@myrmidon/cadmus-refs-external-ids';
import { CadmusRefsHistoricalDateModule } from '@myrmidon/cadmus-refs-historical-date';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusCodLocationModule } from '@myrmidon/cadmus-cod-location';
import { CadmusUiFlagsPickerModule } from '@myrmidon/cadmus-ui-flags-picker';

import { CodDecorationElementComponent } from './cod-decoration-element/cod-decoration-element.component';
import { TextOrEntrySelectorComponent } from './text-or-entry-selector/text-or-entry-selector.component';
import { CodDecorationArtistStyleComponent } from './cod-decoration-artist-style/cod-decoration-artist-style.component';
import { CodDecorationArtistComponent } from './cod-decoration-artist/cod-decoration-artist.component';

@NgModule({
  declarations: [
    CodDecorationElementComponent,
    TextOrEntrySelectorComponent,
    CodDecorationArtistStyleComponent,
    CodDecorationArtistComponent,
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
    // monaco
    MonacoEditorModule,
    // general
    NgMatToolsModule,
    // cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusMatPhysicalSizeModule,
    CadmusRefsAssertedChronotopeModule,
    CadmusRefsAssertionModule,
    CadmusRefsExternalIdsModule,
    CadmusRefsHistoricalDateModule,
    CadmusUiFlagsPickerModule,
    CadmusCodLocationModule,
    CadmusCodicologyUiModule,
  ],
  exports: [
    CodDecorationElementComponent,
    TextOrEntrySelectorComponent,
    CodDecorationArtistStyleComponent,
    CodDecorationArtistComponent
  ],
})
export class CadmusPartCodicologyDecorationsModule {}

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

import { NgToolsModule } from '@myrmidon/ng-tools';
import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';
import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';
import { CadmusMatPhysicalSizeModule } from '@myrmidon/cadmus-mat-physical-size';
import { CadmusRefsAssertionModule } from '@myrmidon/cadmus-refs-assertion';
import { CadmusRefsAssertedChronotopeModule } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { CadmusRefsDocReferencesModule } from '@myrmidon/cadmus-refs-doc-references';
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
import { CodDecorationComponent } from './cod-decoration/cod-decoration.component';
import { CodDecorationsPartComponent } from './cod-decorations-part/cod-decorations-part.component';
import { CodDecorationsPartFeatureComponent } from './cod-decorations-part-feature/cod-decorations-part-feature.component';
import { CadmusRefsAssertedIdsModule } from '@myrmidon/cadmus-refs-asserted-ids';

@NgModule({
  declarations: [
    CodDecorationElementComponent,
    TextOrEntrySelectorComponent,
    CodDecorationArtistStyleComponent,
    CodDecorationArtistComponent,
    CodDecorationComponent,
    CodDecorationsPartComponent,
    CodDecorationsPartFeatureComponent,
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
    NgToolsModule,
    NgMatToolsModule,
    // cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusMatPhysicalSizeModule,
    CadmusRefsAssertedChronotopeModule,
    CadmusRefsAssertedIdsModule,
    CadmusRefsAssertionModule,
    CadmusRefsDocReferencesModule,
    CadmusRefsHistoricalDateModule,
    CadmusUiFlagsPickerModule,
    CadmusCodLocationModule,
    CadmusCodicologyUiModule,
  ],
  exports: [
    CodDecorationElementComponent,
    TextOrEntrySelectorComponent,
    CodDecorationArtistStyleComponent,
    CodDecorationArtistComponent,
    CodDecorationComponent,
    CodDecorationsPartComponent,
    CodDecorationsPartFeatureComponent,
  ],
})
export class CadmusPartCodicologyDecorationsModule {}

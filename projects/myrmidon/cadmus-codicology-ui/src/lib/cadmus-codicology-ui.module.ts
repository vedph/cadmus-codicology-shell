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

import { NgeMarkdownModule } from '@cisstech/nge/markdown';

import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';
import { RefLookupComponent } from '@myrmidon/cadmus-refs-lookup';

import { CadmusApiModule } from '@myrmidon/cadmus-api';

import { CodImagesComponent } from './components/cod-images/cod-images.component';
import { CodLayoutFigureComponent } from './components/cod-layout-figure/cod-layout-figure.component';

@NgModule({
  declarations: [CodImagesComponent, CodLayoutFigureComponent],
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
    // vendors
    NgeMarkdownModule,
    // general
    NgMatToolsModule,
    CadmusApiModule,
    RefLookupComponent
  ],
  exports: [CodImagesComponent, CodLayoutFigureComponent],
})
export class CadmusCodicologyUiModule {}

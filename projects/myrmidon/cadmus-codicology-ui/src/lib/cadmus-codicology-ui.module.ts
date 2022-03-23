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

import { MarkdownModule } from 'ngx-markdown';

import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';

import { CodImagesComponent } from './components/cod-images/cod-images.component';
import { NoteSetComponent } from './components/note-set/note-set.component';
import { CodLayoutFigureComponent } from './components/cod-layout-figure/cod-layout-figure.component';

@NgModule({
  declarations: [
    CodImagesComponent,
    NoteSetComponent,
    CodLayoutFigureComponent,
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
    // vendors
    MarkdownModule,
    // general
    NgMatToolsModule,
  ],
  exports: [CodImagesComponent, NoteSetComponent, CodLayoutFigureComponent],
})
export class CadmusCodicologyUiModule {}

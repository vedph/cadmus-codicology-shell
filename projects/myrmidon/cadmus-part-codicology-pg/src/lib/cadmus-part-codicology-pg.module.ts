import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// cadmus
import { CadmusCoreModule, PendingChangesGuard } from '@myrmidon/cadmus-core';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
// parts
import {
  CodBindingsPartFeatureComponent,
  COD_BINDINGS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-bindings';
import {
  CodContentsPartFeatureComponent,
  COD_CONTENTS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-contents';
import {
  CodEditsPartFeatureComponent,
  COD_EDITS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-edits';
import {
  CodLayoutsPartFeatureComponent,
  COD_LAYOUTS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-layouts';
import {
  CodMaterialDscPartFeatureComponent,
  COD_MATERIAL_DSC_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-material-dsc';
import {
  CodShelfmarksPartFeatureComponent,
  COD_SHELFMARKS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-shelfmarks';
import {
  CodWatermarksPartFeatureComponent,
  COD_WATERMARKS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-watermarks';

export const RouterModuleForChild = RouterModule.forChild([
  {
    path: `${COD_BINDINGS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodBindingsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_CONTENTS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodContentsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_EDITS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodEditsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_LAYOUTS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodLayoutsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_MATERIAL_DSC_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodMaterialDscPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_SHELFMARKS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodShelfmarksPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_WATERMARKS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodWatermarksPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
]);

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Cadmus
    RouterModuleForChild,
    CadmusCoreModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
  ],
  exports: [],
})
export class CadmusPartCodicologyPgModule {}

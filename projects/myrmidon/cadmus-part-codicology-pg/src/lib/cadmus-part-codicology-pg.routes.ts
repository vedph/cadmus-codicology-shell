import { Routes } from '@angular/router';

// cadmus
import { PendingChangesGuard } from '@myrmidon/cadmus-core';
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
  CodDecorationsPartFeatureComponent,
  COD_DECORATIONS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-decorations';
import {
  CodEditsPartFeatureComponent,
  COD_EDITS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-edits';
import {
  CodHandsPartFeatureComponent,
  COD_HANDS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-hands';
import {
  CodLayoutsPartFeatureComponent,
  COD_LAYOUTS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-layouts';
import {
  CodMaterialDscPartFeatureComponent,
  COD_MATERIAL_DSC_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-material-dsc';
import {
  CodSheetLabelsPartFeatureComponent,
  COD_SHEET_LABELS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-sheet-labels';
import {
  CodShelfmarksPartFeatureComponent,
  COD_SHELFMARKS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-shelfmarks';
import {
  CodWatermarksPartFeatureComponent,
  COD_WATERMARKS_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-watermarks';

export const CADMUS_PART_CODICOLOGY_PG_ROUTES: Routes = [
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
    path: `${COD_DECORATIONS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodDecorationsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_EDITS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodEditsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_HANDS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodHandsPartFeatureComponent,
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
    path: `${COD_SHEET_LABELS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodSheetLabelsPartFeatureComponent,
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
];

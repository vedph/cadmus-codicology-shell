import { PendingChangesGuard } from '@myrmidon/cadmus-core';
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
  CodLocationRangesPartFeature,
  COD_LOCATION_RANGES_PART_TYPEID,
} from '@myrmidon/cadmus-part-codicology-location-ranges';
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

import { CADMUS_PART_CODICOLOGY_PG_ROUTES } from './cadmus-part-codicology-pg.routes';

describe('CADMUS_PART_CODICOLOGY_PG_ROUTES', () => {
  const EXPECTED: [string, unknown][] = [
    [COD_BINDINGS_PART_TYPEID, CodBindingsPartFeatureComponent],
    [COD_CONTENTS_PART_TYPEID, CodContentsPartFeatureComponent],
    [COD_DECORATIONS_PART_TYPEID, CodDecorationsPartFeatureComponent],
    [COD_EDITS_PART_TYPEID, CodEditsPartFeatureComponent],
    [COD_HANDS_PART_TYPEID, CodHandsPartFeatureComponent],
    [COD_LAYOUTS_PART_TYPEID, CodLayoutsPartFeatureComponent],
    [COD_LOCATION_RANGES_PART_TYPEID, CodLocationRangesPartFeature],
    [COD_MATERIAL_DSC_PART_TYPEID, CodMaterialDscPartFeatureComponent],
    [COD_SHEET_LABELS_PART_TYPEID, CodSheetLabelsPartFeatureComponent],
    [COD_SHELFMARKS_PART_TYPEID, CodShelfmarksPartFeatureComponent],
    [COD_WATERMARKS_PART_TYPEID, CodWatermarksPartFeatureComponent],
  ];

  it('should have a route for each codicology part', () => {
    expect(CADMUS_PART_CODICOLOGY_PG_ROUTES).toHaveLength(EXPECTED.length);
  });

  it('should have unique paths', () => {
    const paths = CADMUS_PART_CODICOLOGY_PG_ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it.each(EXPECTED)(
    'should route %s/:pid to its feature editor',
    (typeId, component) => {
      const route = CADMUS_PART_CODICOLOGY_PG_ROUTES.find(
        (r) => r.path === `${typeId}/:pid`,
      );

      expect(route).toBeDefined();
      expect(route!.component).toBe(component);
      expect(route!.pathMatch).toBe('full');
    },
  );

  it('should guard all routes against pending changes', () => {
    for (const route of CADMUS_PART_CODICOLOGY_PG_ROUTES) {
      expect(route.canDeactivate).toEqual([PendingChangesGuard]);
    }
  });
});

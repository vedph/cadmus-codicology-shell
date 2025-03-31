import { PartEditorKeys } from '@myrmidon/cadmus-core';

import { COD_BINDINGS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-bindings/src/public-api';
import { COD_CONTENTS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-contents/src/public-api';
import { COD_DECORATIONS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-decorations/src/public-api';
import { COD_EDITS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-edits/src/public-api';
import { COD_HANDS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-hands/src/public-api';
import { COD_LAYOUTS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-layouts/src/public-api';
import { COD_MATERIAL_DSC_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-material-dsc/src/public-api';
import { COD_SHEET_LABELS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-sheet-labels/src/public-api';
import { COD_SHELFMARKS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-shelfmarks/src/public-api';
import { COD_WATERMARKS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-watermarks/src/public-api';

const CODICOLOGY = 'codicology';

/**
 * The parts and fragments editor keys for this UI.
 * Each property is a part type ID, mapped to a value of type PartGroupKey,
 * having a part property with the part's editor key, and a fragments property
 * with the mappings between fragment type IDs and their editor keys.
 */
export const PART_EDITOR_KEYS: PartEditorKeys = {
  [COD_BINDINGS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_CONTENTS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_DECORATIONS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_EDITS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_HANDS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_LAYOUTS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_MATERIAL_DSC_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_SHEET_LABELS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_SHELFMARKS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_WATERMARKS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
};

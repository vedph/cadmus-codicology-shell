import { PartEditorKeys } from '@myrmidon/cadmus-core';

import { COD_BINDINGS_PART_TYPEID } from 'projects/myrmidon/cadmus-part-codicology-bindings/src/public-api';
import { COD_SHELFMARKS_PART_TYPEID } from 'projects/myrmidon/cadmus-part-codicology-shelfmarks/src/public-api';

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
  [COD_SHELFMARKS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
};

import { IndexLookupDefinitions } from '@myrmidon/cadmus-core';
import { METADATA_PART_TYPEID } from '@myrmidon/cadmus-part-general-ui';

import { COD_DECORATIONS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-decorations/src/public-api';

export const INDEX_LOOKUP_DEFINITIONS: IndexLookupDefinitions = {
  metadata_eid: {
    typeId: METADATA_PART_TYPEID,
    name: 'eid',
  },
  decor_elem_key: {
    typeId: COD_DECORATIONS_PART_TYPEID,
    name: 'element-key',
  },
};

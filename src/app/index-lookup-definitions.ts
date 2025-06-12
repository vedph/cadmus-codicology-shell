import { IndexLookupDefinitions } from '@myrmidon/cadmus-core';
import {
  HISTORICAL_EVENTS_PART_TYPEID,
  METADATA_PART_TYPEID,
} from '@myrmidon/cadmus-part-general-ui';

import { COD_DECORATIONS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-decorations/src/public-api';
import { COD_EDITS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-edits/src/public-api';
import { COD_CONTENTS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-contents/src/public-api';
import { COD_MATERIAL_DSC_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-material-dsc/src/public-api';
import { COD_HANDS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-codicology-hands/src/public-api';

export const INDEX_LOOKUP_DEFINITIONS: IndexLookupDefinitions = {
  // item's metadata
  meta_eid: {
    typeId: METADATA_PART_TYPEID,
    name: 'eid',
  },
  // general parts
  event_eid: {
    typeId: HISTORICAL_EVENTS_PART_TYPEID,
    name: 'eid',
  },
  // codicology parts
  cod_matdsc_eid: {
    typeId: COD_MATERIAL_DSC_PART_TYPEID,
    name: 'unit-eid',
  },
  cod_hand_eid: {
    typeId: COD_HANDS_PART_TYPEID,
    name: 'eid',
  },
  cod_decoration_eid: {
    typeId: COD_DECORATIONS_PART_TYPEID,
    name: 'eid',
  },
  cod_artist_eid: {
    typeId: COD_DECORATIONS_PART_TYPEID,
    name: 'artist-id',
  },
  cod_content_eid: {
    typeId: COD_CONTENTS_PART_TYPEID,
    name: 'eid',
  },
  cod_edit_eid: {
    typeId: COD_EDITS_PART_TYPEID,
    name: 'eid',
  },
};

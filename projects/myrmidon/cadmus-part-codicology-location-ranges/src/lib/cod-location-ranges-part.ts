import { Part } from '@myrmidon/cadmus-core';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';

/**
 * The CodLocationRanges part model.
 */
export interface CodLocationRangesPart extends Part {
  ranges: CodLocationRange[];
  note?: string;
}

/**
 * The type ID used to identify the CodLocationRangesPart type.
 */
export const COD_LOCATION_RANGES_PART_TYPEID =
  'it.vedph.codicology.location-ranges';

/**
 * JSON schema for the CodLocationRanges part.
 */
export const COD_LOCATION_RANGES_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' +
    COD_LOCATION_RANGES_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'CodLocationRangesPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'ranges',
  ],
  properties: {
    timeCreated: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    creatorId: {
      type: 'string',
    },
    timeModified: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    userId: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    itemId: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    typeId: {
      type: 'string',
      pattern: '^[a-z][-0-9a-z._]*$',
    },
    roleId: {
      type: ['string', 'null'],
      pattern: '^([a-z][-0-9a-z._]*)?$',
    },
    ranges: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['start', 'end'],
            properties: {
              start: {
                type: 'object',
                required: ['n'],
                properties: {
                  endleaf: {
                    type: 'integer',
                  },
                  s: {
                    type: 'string',
                  },
                  n: {
                    type: 'integer',
                  },
                  rmn: {
                    type: 'boolean',
                  },
                  sfx: {
                    type: 'string',
                  },
                  v: {
                    type: 'boolean',
                  },
                  c: {
                    type: 'integer',
                  },
                  l: {
                    type: 'integer',
                  },
                  word: {
                    type: 'string',
                  },
                },
              },
              end: {
                type: 'object',
                required: ['n'],
                properties: {
                  endleaf: {
                    type: 'integer',
                  },
                  s: {
                    type: 'string',
                  },
                  n: {
                    type: 'integer',
                  },
                  rmn: {
                    type: 'boolean',
                  },
                  sfx: {
                    type: 'string',
                  },
                  v: {
                    type: 'boolean',
                  },
                  c: {
                    type: 'integer',
                  },
                  l: {
                    type: 'integer',
                  },
                  word: {
                    type: 'string',
                  },
                },
              },
            },
          },
        ],
      },
    },
    note: {
      type: 'string',
    },
  },
};

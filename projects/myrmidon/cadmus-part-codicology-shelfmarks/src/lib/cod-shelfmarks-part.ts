import { Part } from '@myrmidon/cadmus-core';

/**
 * A manuscript's shelfmark.
 */
export interface CodShelfmark {
  tag?: string;
  city: string;
  library: string;
  fund?: string;
  location: string;
}

/**
 * The CodShelfmarks part model.
 */
export interface CodShelfmarksPart extends Part {
  shelfmarks: CodShelfmark[];
}

/**
 * The type ID used to identify the CodShelfmarksPart type.
 */
export const COD_SHELFMARKS_PART_TYPEID = 'it.vedph.codicology.shelfmarks';

/**
 * JSON schema for the CodShelfmarks part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_SHELFMARKS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' +
    COD_SHELFMARKS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'CodShelfmarksPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'shelfmarks',
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
    shelfmarks: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['city', 'library', 'location'],
            properties: {
              tag: {
                type: 'string',
              },
              city: {
                type: 'string',
              },
              library: {
                type: 'string',
              },
              fund: {
                type: 'string',
              },
              location: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
  },
};

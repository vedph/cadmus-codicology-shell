import { CodLocation, CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { Part } from '@myrmidon/cadmus-core';
import { PhysicalDimension } from '@myrmidon/cadmus-mat-physical-size';
import { DecoratedCount } from '@myrmidon/cadmus-refs-decorated-counts';

export interface CodLayout {
  sample: CodLocation;
  ranges: CodLocationRange[];
  dimensions?: PhysicalDimension[];
  rulingTechnique?: string;
  derolez?: string;
  pricking?: string;
  columnCount: number;
  counts?: DecoratedCount[];
  tag?: string;
  note?: string;
}

/**
 * The manuscript's layouts part model.
 */
export interface CodLayoutsPart extends Part {
  layouts: CodLayout[];
}

/**
 * The type ID used to identify the CodLayoutsPart type.
 */
export const COD_LAYOUTS_PART_TYPEID = 'it.vedph.codicology.layouts';

/**
 * JSON schema for the CodLayouts part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_LAYOUTS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' + COD_LAYOUTS_PART_TYPEID + '.json',
  type: 'object',
  title: 'CodLayoutsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'layouts',
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
    layouts: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['sample', 'ranges', 'columnCount'],
            properties: {
              sample: {
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
              dimensions: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['value', 'unit'],
                      properties: {
                        tag: {
                          type: 'string',
                        },
                        value: {
                          type: 'integer',
                        },
                        unit: {
                          type: 'string',
                        },
                      },
                    },
                  ],
                },
              },
              rulingTechnique: {
                type: 'string',
              },
              derolez: {
                type: 'string',
              },
              pricking: {
                type: 'string',
              },
              columnCount: {
                type: 'integer',
              },
              counts: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['id', 'value', 'tag', 'note'],
                      properties: {
                        id: {
                          type: 'string',
                        },
                        value: {
                          type: 'integer',
                        },
                        tag: {
                          type: 'string',
                        },
                        note: {
                          type: 'string',
                        },
                      },
                    },
                  ],
                },
              },
              tag: {
                type: 'string',
              },
              note: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
  },
};

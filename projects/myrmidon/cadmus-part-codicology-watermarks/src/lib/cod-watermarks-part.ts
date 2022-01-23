import { Part } from '@myrmidon/cadmus-core';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { RankedExternalId } from '@myrmidon/cadmus-refs-external-ids';
import { PhysicalSize } from '@myrmidon/cadmus-mat-physical-size';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';

/**
 * A watermark.
 */
export interface CodWatermark {
  name: string;
  sampleRange: CodLocationRange;
  ranges?: CodLocationRange[];
  ids?: RankedExternalId[];
  size?: PhysicalSize;
  chronotope?: AssertedChronotope;
  description?: string;
}

/**
 * The CodWatermarks part model.
 */
export interface CodWatermarksPart extends Part {
  watermarks: CodWatermark[];
}

/**
 * The type ID used to identify the CodWatermarksPart type.
 */
export const COD_WATERMARKS_PART_TYPEID = 'it.vedph.codicology.watermarks';

/**
 * JSON schema for the CodWatermarks part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_WATERMARKS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' +
    COD_WATERMARKS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'CodWatermarksPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'watermarks',
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
    name: {
      type: 'string',
    },
    sampleRange: {
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
    ids: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['value'],
            properties: {
              value: {
                type: 'string',
              },
              scope: {
                type: 'string',
              },
              tag: {
                type: 'string',
              },
              assertion: {
                type: 'object',
                required: ['rank'],
                properties: {
                  tag: {
                    type: 'string',
                  },
                  rank: {
                    type: 'integer',
                  },
                  note: {
                    type: 'string',
                  },
                  references: {
                    type: 'array',
                    items: {
                      anyOf: [
                        {
                          type: 'object',
                          required: ['citation'],
                          properties: {
                            type: {
                              type: 'string',
                            },
                            tag: {
                              type: 'string',
                            },
                            citation: {
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
              },
            },
          },
        ],
      },
    },
    size: {
      type: 'object',
      required: [],
      properties: {
        tag: {
          type: 'string',
        },
        w: {
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
        h: {
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
        d: {
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
      },
    },
    chronotope: {
      place: {
        type: 'object',
        required: ['value'],
        properties: {
          tag: {
            type: 'string',
          },
          value: {
            type: 'string',
          },
          assertion: {
            type: 'object',
            required: ['rank'],
            properties: {
              tag: {
                type: 'string',
              },
              rank: {
                type: 'integer',
              },
              note: {
                type: 'string',
              },
              references: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['citation'],
                      properties: {
                        type: {
                          type: 'string',
                        },
                        tag: {
                          type: 'string',
                        },
                        citation: {
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
          },
        },
      },
      date: {
        type: 'object',
        required: ['a'],
        properties: {
          tag: {
            type: 'string',
          },
          a: {
            type: 'object',
            required: ['value'],
            properties: {
              value: {
                type: 'integer',
              },
              isCentury: {
                type: 'boolean',
              },
              isSpan: {
                type: 'boolean',
              },
              isApproximate: {
                type: 'boolean',
              },
              isDubious: {
                type: 'boolean',
              },
              day: {
                type: 'integer',
              },
              month: {
                type: 'integer',
              },
              hint: {
                type: ['string', 'null'],
              },
            },
          },
          b: {
            type: 'object',
            required: ['value'],
            properties: {
              value: {
                type: 'integer',
              },
              isCentury: {
                type: 'boolean',
              },
              isSpan: {
                type: 'boolean',
              },
              isApproximate: {
                type: 'boolean',
              },
              isDubious: {
                type: 'boolean',
              },
              day: {
                type: 'integer',
              },
              month: {
                type: 'integer',
              },
              hint: {
                type: ['string', 'null'],
              },
            },
          },
          assertion: {
            type: 'object',
            required: ['rank'],
            properties: {
              tag: {
                type: 'string',
              },
              rank: {
                type: 'integer',
              },
              note: {
                type: 'string',
              },
              references: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['citation'],
                      properties: {
                        type: {
                          type: 'string',
                        },
                        tag: {
                          type: 'string',
                        },
                        citation: {
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
          },
        },
      },
    },
    description: {
      type: 'string',
    },
  },
};

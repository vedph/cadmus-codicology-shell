import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { Part } from '@myrmidon/cadmus-core';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';
import { HistoricalDate } from '@myrmidon/cadmus-refs-historical-date';

/**
 * An implementation difference in an illuminator instruction.
 */
export interface CodIllumInstructionDiff {
  type: string;
  target?: string;
  note?: string;
}

/**
 * A color reuse in an illuminator instruction.
 */
export interface CodIllumColorReuse {
  color: string;
  range: CodLocationRange;
  note?: string;
}

/**
 * The illuminator instructions part model.
 */
export interface CodIllumInstructionsPart extends Part {
  types: string[];
  prevTypes?: string[];
  nextTypes?: string[];
  subject?: string;
  script: string;
  text?: string;
  sequences?: string[];
  repertoire?: string;
  range: CodLocationRange;
  position: string;
  positionNote?: string;
  targetLocation?: CodLocationRange;
  implementation?: string;
  differences?: CodIllumInstructionDiff[];
  note?: string;
  description?: string;
  features?: string[];
  languages?: string[];
  tools?: string[];
  colors?: string[];
  colorReuses?: CodIllumColorReuse[];
  date?: HistoricalDate;
  assertion?: Assertion;
}

/**
 * The type ID used to identify the CodIllumInstructionsPart type.
 */
export const COD_ILLUM_INSTRUCTIONS_PART_TYPEID =
  'it.vedph.codicology.illum-instructions';

/**
 * JSON schema for the CodIllumInstructions part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_ILLUM_INSTRUCTIONS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' +
    COD_ILLUM_INSTRUCTIONS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'CodIllumInstructionsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'types',
    'script',
    'range',
    'position',
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
    types: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    prevTypes: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    nextTypes: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    subject: {
      type: 'string',
    },
    script: {
      type: 'string',
    },
    text: {
      type: 'string',
    },
    sequences: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    repertoire: {
      type: 'string',
    },
    range: {
      type: 'object',
      required: ['start', 'end'],
      properties: {
        start: {
          type: 'object',
          required: ['n', 'unit'],
          properties: {
            n: {
              type: 'integer',
            },
            unit: {
              type: 'string',
            },
          },
        },
        end: {
          type: 'object',
          required: ['n', 'unit'],
          properties: {
            n: {
              type: 'integer',
            },
            unit: {
              type: 'string',
            },
          },
        },
      },
    },
    position: {
      type: 'string',
    },
    positionNote: {
      type: 'string',
    },
    targetLocation: {
      type: 'object',
      required: ['start', 'end'],
      properties: {
        start: {
          type: 'object',
          required: ['n', 'unit'],
          properties: {
            n: {
              type: 'integer',
            },
            unit: {
              type: 'string',
            },
          },
        },
        end: {
          type: 'object',
          required: ['n', 'unit'],
          properties: {
            n: {
              type: 'integer',
            },
            unit: {
              type: 'string',
            },
          },
        },
      },
    },
    implementation: {
      type: 'string',
    },
    differences: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type'],
        properties: {
          type: {
            type: 'string',
          },
          target: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
        },
      },
    },
    note: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    features: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    languages: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    tools: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    colors: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    colorReuses: {
      type: 'array',
      items: {
        type: 'object',
        required: ['color', 'range'],
        properties: {
          color: {
            type: 'string',
          },
          range: {
            type: 'object',
            required: ['start', 'end'],
            properties: {
              start: {
                type: 'object',
                required: ['n', 'unit'],
                properties: {
                  n: {
                    type: 'integer',
                  },
                  unit: {
                    type: 'string',
                  },
                },
              },
              end: {
                type: 'object',
                required: ['n', 'unit'],
                properties: {
                  n: {
                    type: 'integer',
                  },
                  unit: {
                    type: 'string',
                  },
                },
              },
            },
          },
          note: {
            type: 'string',
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
};

import { Part } from '@myrmidon/cadmus-core';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { HistoricalDateModel } from '@myrmidon/cadmus-refs-historical-date';

export interface CodColumn {
  id: string;
  value?: string;
  note?: string;
}

export interface CodRow {
  id: string;
  columns: CodColumn[];
}

export interface CodEndleaf {
  location: string;
  material: string;
  chronotope?: AssertedChronotope;
}

export interface CodColDefinition {
  id: string;
  rank?: number;
  note?: string;
}

export interface CodNColDefinition extends CodColDefinition {
  isPagination?: boolean;
  isByScribe?: boolean;
  system: string;
  technique: string;
  position: string;
  colors?: string[];
  date?: HistoricalDateModel;
}

export interface CodCColDefinition extends CodColDefinition {
  position: string;
  isVertical?: boolean;
  decoration?: string;
}

export interface CodSColDefinition extends CodColDefinition {
  system: string;
  position: string;
}

export interface CodRColDefinition extends CodColDefinition {
  position: string;
}

/**
 * The CodSheetLabels part model.
 */
export interface CodSheetLabelsPart extends Part {
  rows: CodRow[];
  endleaves?: CodEndleaf[];
  nDefinitions?: CodNColDefinition[];
  cDefinitions?: CodCColDefinition[];
  sDefinitions?: CodSColDefinition[];
  rDefinitions?: CodRColDefinition[];
  note?: string;
}

/**
 * The type ID used to identify the CodSheetLabelsPart type.
 */
export const COD_SHEET_LABELS_PART_TYPEID =
  'it.vedph.codicology.sheet-labels';

/**
 * JSON schema for the CodSheetLabels part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_SHEET_LABELS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' +
    COD_SHEET_LABELS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'CodSheetLabelsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'rows'
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
    rows: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['id', 'columns'],
            properties: {
              id: {
                type: 'string',
              },
              columns: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['id'],
                      properties: {
                        id: {
                          type: 'string',
                        },
                        value: {
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
        ],
      },
    },
    endleaves: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['location', 'material'],
            properties: {
              location: {
                type: 'string',
              },
              material: {
                type: 'string',
              },
              chronotope: {
                type: 'object',
                required: [],
                properties: {
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
              },
            },
          },
        ],
      },
    },
    nDefinitions: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['id', 'system', 'technique', 'position'],
            properties: {
              id: {
                type: 'string',
              },
              rank: {
                type: 'integer',
              },
              note: {
                type: 'string',
              },
              isPagination: {
                type: 'boolean',
              },
              isByScribe: {
                type: 'boolean'
              },
              system: {
                type: 'string',
              },
              technique: {
                type: 'string',
              },
              position: {
                type: 'string',
              },
              colors: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                  ],
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
          },
        ],
      },
    },
    cDefinitions: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['id', 'position'],
            properties: {
              id: {
                type: 'string',
              },
              rank: {
                type: 'integer',
              },
              note: {
                type: 'string',
              },
              position: {
                type: 'string',
              },
              isVertical: {
                type: 'boolean',
              },
              decoration: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
    sDefinitions: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['id', 'system', 'position'],
            properties: {
              id: {
                type: 'string',
              },
              rank: {
                type: 'integer',
              },
              note: {
                type: 'string',
              },
              system: {
                type: 'string',
              },
              position: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
    rDefinitions: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['id', 'position'],
            properties: {
              id: {
                type: 'string',
              },
              rank: {
                type: 'integer',
              },
              note: {
                type: 'string',
              },
              position: {
                type: 'string',
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

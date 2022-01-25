import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { Part } from '@myrmidon/cadmus-core';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';

/**
 * A codicological unit in CodMaterialDsc.
 */
export interface CodUnit {
  eid?: string;
  tag?: string;
  material: string;
  format: string;
  state: string;
  range: CodLocationRange;
  chronotopes?: AssertedChronotope[];
  noGregory?: boolean;
  note?: string;
}

/**
 * One or more palimpsest sheets in CodMaterialDsc.
 */
export interface CodPalimpsest {
  range: CodLocationRange;
  chronotope?: AssertedChronotope;
  note?: string;
}

/**
 * Endleaf in CodMaterialDsc.
 */
export interface CodEndleaf {
  type: string;
  material: string;
  range: CodLocationRange;
  chronotope?: AssertedChronotope;
  note?: string;
}

/**
 * The CodMaterialDsc part model.
 */
export interface CodMaterialDscPart extends Part {
  units: CodUnit[];
  palimpsests?: CodPalimpsest[];
  endleaves?: CodEndleaf[];
}

/**
 * The type ID used to identify the CodMaterialDscPart type.
 */
export const COD_MATERIAL_DSC_PART_TYPEID = 'it.vedph.codicology.material-dsc';

/**
 * JSON schema for the CodMaterialDsc part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_MATERIAL_DSC_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' +
    COD_MATERIAL_DSC_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'CodMaterialDscPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'units',
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
    units: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['material', 'format', 'state', 'range'],
            properties: {
              eid: {
                type: 'string',
              },
              tag: {
                type: 'string',
              },
              material: {
                type: 'string',
              },
              format: {
                type: 'string',
              },
              state: {
                type: 'string',
              },
              range: {
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
              chronotopes: {
                type: 'array',
                items: {
                  anyOf: [
                    {
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
                  ],
                },
              },
              noGregory: {
                type: 'boolean',
              },
              note: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
    palimpsests: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['range', 'chronotope', 'note'],
            properties: {
              range: {
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
              note: {
                type: 'string',
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
            required: ['type', 'material', 'range'],
            properties: {
              type: {
                type: 'string',
              },
              material: {
                type: 'string',
              },
              range: {
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

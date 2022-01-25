import { Part } from '@myrmidon/cadmus-core';
import { PhysicalSize } from '@myrmidon/cadmus-mat-physical-size';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';

export interface CodBinding {
  tag?: string;
  coverMaterial: string;
  boardMaterial: string;
  chronotope: AssertedChronotope;
  size?: PhysicalSize;
  description?: string;
}

/**
 * The CodBindings part model.
 */
export interface CodBindingsPart extends Part {
  bindings: CodBinding[];
}

/**
 * The type ID used to identify the CodBindingsPart type.
 */
export const COD_BINDINGS_PART_TYPEID = 'it.vedph.codicology.bindings';

/**
 * JSON schema for the CodBindings part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_BINDINGS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' +
    COD_BINDINGS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'CodBindingsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'bindings',
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
    bindings: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['coverMaterial', 'boardMaterial', 'chronotope'],
            properties: {
              tag: {
                type: 'string',
              },
              coverMaterial: {
                type: 'string',
              },
              boardMaterial: {
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
              description: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
  },
};

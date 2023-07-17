import { CodLocation, CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { CodImage } from '@myrmidon/cadmus-codicology-ui';
import { Part } from '@myrmidon/cadmus-core';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';

/**
 * A hand's subscription.
 */
export interface CodHandSubscription {
  ranges: CodLocationRange[];
  language: string;
  text?: string;
  note?: string;
}

/**
 * A sign in a CodHandDescription.
 */
export interface CodHandSign {
  eid?: string;
  type: string;
  sampleLocation: CodLocation;
  description?: string;
}

/**
 * A description for a set of hand's features.
 */
export interface CodHandDescription {
  key?: string;
  description?: string;
  initials?: string;
  corrections?: string;
  punctuation?: string;
  abbreviations?: string;
  signs?: CodHandSign[];
}

/**
 * An instance of a hand.
 */
export interface CodHandInstance {
  scripts: string[];
  typologies: string[];
  colors?: string[];
  ranges: CodLocationRange[];
  rank?: number;
  descriptionKey?: string;
  chronotope?: AssertedChronotope;
  images?: CodImage[];
}

/**
 * A hand in a CodHandsPart.
 */
export interface CodHand {
  eid?: string;
  name?: string;
  instances: CodHandInstance[];
  descriptions: CodHandDescription[];
  subscriptions?: CodHandSubscription[];
  references?: DocReference[];
  ids?: AssertedCompositeId[];
}

/**
 * The manuscript's hands part model.
 */
export interface CodHandsPart extends Part {
  hands: CodHand[];
}

/**
 * The type ID used to identify the CodHandsPart type.
 */
export const COD_HANDS_PART_TYPEID = 'it.vedph.codicology.hands';

/**
 * JSON schema for the CodHands part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_HANDS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' + COD_HANDS_PART_TYPEID + '.json',
  type: 'object',
  title: 'CodHandsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'hands',
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
    hands: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['instances', 'descriptions'],
            properties: {
              eid: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              instances: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['scripts', 'typologies', 'ranges'],
                      properties: {
                        scripts: {
                          type: 'array',
                          items: {
                            anyOf: [
                              {
                                type: 'string',
                              },
                            ],
                          },
                        },
                        typologies: {
                          type: 'array',
                          items: {
                            anyOf: [
                              {
                                type: 'string',
                              },
                            ],
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
                        rank: {
                          type: 'integer',
                        },
                        descriptionKey: {
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
                                    ids: {
                                      type: 'array',
                                      items: {
                                        type: 'object',
                                        default: {},
                                        required: ['target'],
                                        properties: {
                                          target: {
                                            type: 'object',
                                            required: ['gid', 'label'],
                                            properties: {
                                              gid: {
                                                type: 'string',
                                              },
                                              label: {
                                                type: 'string',
                                              },
                                              itemId: {
                                                type: 'string',
                                              },
                                              partId: {
                                                type: 'string',
                                              },
                                              partTypeId: {
                                                type: 'string',
                                              },
                                              roleId: {
                                                type: 'string',
                                              },
                                              name: {
                                                type: 'string',
                                              },
                                              value: {
                                                type: 'string',
                                              },
                                            },
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
                        images: {
                          type: 'array',
                          items: {
                            anyOf: [
                              {
                                type: 'object',
                                required: ['id', 'type'],
                                properties: {
                                  id: {
                                    type: 'string',
                                  },
                                  type: {
                                    type: 'string',
                                  },
                                  sourceId: {
                                    type: 'string',
                                  },
                                  label: {
                                    type: 'string',
                                  },
                                  copyright: {
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
              descriptions: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: [],
                      properties: {
                        key: {
                          type: 'string',
                        },
                        description: {
                          type: 'string',
                        },
                        initials: {
                          type: 'string',
                        },
                        corrections: {
                          type: 'string',
                        },
                        punctuation: {
                          type: 'string',
                        },
                        abbreviations: {
                          type: 'string',
                        },
                        signs: {
                          type: 'array',
                          items: {
                            anyOf: [
                              {
                                type: 'object',
                                required: ['type', 'sampleLocation'],
                                properties: {
                                  eid: {
                                    type: 'string',
                                  },
                                  type: {
                                    type: 'string',
                                  },
                                  sampleLocation: {
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
                                        type: 'string',
                                      },
                                      l: {
                                        type: 'integer',
                                      },
                                      word: {
                                        type: 'string',
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
                    },
                  ],
                },
              },
              subscriptions: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['ranges', 'language'],
                      properties: {
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
                        language: {
                          type: 'string',
                        },
                        text: {
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
        ],
      },
    },
  },
};

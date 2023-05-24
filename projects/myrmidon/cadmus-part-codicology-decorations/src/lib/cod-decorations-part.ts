import { Part } from '@myrmidon/cadmus-core';

import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';
import { CodImage } from '@myrmidon/cadmus-codicology-ui';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

/**
 * A conventional style in a decoration's artist.
 */
export interface CodDecorationArtistStyle {
  name: string;
  chronotope?: AssertedChronotope;
  assertion?: Assertion;
}

/**
 * The artist of a manuscript's decoration.
 */
export interface CodDecorationArtist {
  eid?: string;
  type: string;
  name: string;
  ids?: AssertedCompositeId[];
  styles?: CodDecorationArtistStyle[];
  elementKeys?: string[];
  note?: string;
}

/**
 * An element of a manuscript's decoration.
 */
export interface CodDecorationElement {
  key?: string;
  parentKey?: string;
  type: string;
  flags: string[];
  ranges: CodLocationRange[];
  instanceCount?: number;
  typologies?: string[];
  subject?: string;
  colors?: string[];
  gildings?: string[];
  techniques?: string[];
  tools?: string[];
  positions?: string[];
  lineHeight?: number;
  textRelation?: string;
  description?: string;
  images?: CodImage[];
  note?: string;
}

/**
 * A decoration in a manuscript.
 */
export interface CodDecoration {
  eid?: string;
  name: string;
  flags?: string[];
  chronotopes?: AssertedChronotope[];
  artists?: CodDecorationArtist[];
  note?: string;
  references?: DocReference[];
  elements?: CodDecorationElement[];
}

/**
 * The decorations part model.
 */
export interface CodDecorationsPart extends Part {
  decorations: CodDecoration[];
}

/**
 * The type ID used to identify the MsDecorationsPart type.
 */
export const COD_DECORATIONS_PART_TYPEID = 'it.vedph.codicology.decorations';

/**
 * JSON schema for the decorations part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_DECORATIONS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/itinera/ms/' +
    COD_DECORATIONS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'MsDecorationsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'decorations',
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
    decorations: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['name'],
            properties: {
              eid: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              flags: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                  ],
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
              artists: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['type', 'name'],
                      properties: {
                        eid: {
                          type: 'string',
                        },
                        type: {
                          type: 'string',
                        },
                        name: {
                          type: 'string',
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
                        styles: {
                          type: 'array',
                          items: {
                            anyOf: [
                              {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                  name: {
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
                                additionalProperties: true,
                              },
                            ],
                          },
                        },
                        elementKeys: {
                          type: 'array',
                          items: {
                            anyOf: [{ type: 'string' }],
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
              elements: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['type', 'flags', 'ranges'],
                      properties: {
                        type: {
                          type: 'string',
                        },
                        flags: {
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
                        key: {
                          type: 'string',
                        },
                        parentKey: {
                          type: 'string',
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
                        subject: {
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
                        gildings: {
                          type: 'array',
                          items: {
                            anyOf: [
                              {
                                type: 'string',
                              },
                            ],
                          },
                        },
                        techniques: {
                          type: 'array',
                          items: {
                            anyOf: [
                              {
                                type: 'string',
                              },
                            ],
                          },
                        },
                        tools: {
                          type: 'array',
                          items: {
                            anyOf: [
                              {
                                type: 'string',
                              },
                            ],
                          },
                        },
                        positions: {
                          type: 'array',
                          items: {
                            anyOf: [
                              {
                                type: 'string',
                              },
                            ],
                          },
                        },
                        lineHeight: {
                          type: 'integer',
                        },
                        textRelation: {
                          type: 'string',
                        },
                        description: {
                          type: 'string',
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

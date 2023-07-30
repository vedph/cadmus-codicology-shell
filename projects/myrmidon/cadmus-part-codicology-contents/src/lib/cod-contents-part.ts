import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { Part } from '@myrmidon/cadmus-core';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

export interface CodContentAnnotation {
  type: string;
  range: CodLocationRange;
  incipit: string;
  explicit?: string;
  text?: string;
  note?: string;
}

export interface CodContent {
  eid?: string;
  ranges: CodLocationRange[];
  states: string[];
  workId?: AssertedCompositeId;
  author?: string;
  title?: string;
  location?: string;
  claimedAuthor?: string;
  claimedTitle?: string;
  tag?: string;
  note?: string;
  incipit?: string;
  explicit?: string;
  annotations?: CodContentAnnotation[];
}

/**
 * The CodContents part model.
 */
export interface CodContentsPart extends Part {
  contents: CodContent[];
}

/**
 * The type ID used to identify the CodContentsPart type.
 */
export const COD_CONTENTS_PART_TYPEID = 'it.vedph.codicology.contents';

/**
 * JSON schema for the CodContents part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_CONTENTS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' +
    COD_CONTENTS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'CodContentsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'contents',
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
    contents: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['ranges', 'states', 'title'],
            properties: {
              eid: {
                type: 'string',
              },
              author: {
                type: 'string',
              },
              workId: {
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
              states: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                  ],
                },
              },
              title: {
                type: 'string',
              },
              location: {
                type: 'string',
              },
              claimedAuthor: {
                type: 'string',
              },
              claimedTitle: {
                type: 'string',
              },
              tag: {
                type: 'string',
              },
              note: {
                type: 'string',
              },
              incipit: {
                type: 'string',
              },
              explicit: {
                type: 'string',
              },
              annotations: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['type', 'range', 'incipit'],
                      properties: {
                        type: {
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
                        incipit: {
                          type: 'string',
                        },
                        explicit: {
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
            },
          },
        ],
      },
    },
  },
};

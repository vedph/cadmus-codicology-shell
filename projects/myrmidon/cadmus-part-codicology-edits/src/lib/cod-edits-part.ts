import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { Part } from '@myrmidon/cadmus-core';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import { HistoricalDateModel } from '@myrmidon/cadmus-refs-historical-date';

export interface CodEdit {
  eid?: string;
  type: string;
  tag?: string;
  authorIds?: AssertedCompositeId[];
  techniques?: string[];
  ranges: CodLocationRange[];
  language?: string;
  colors?: string[];
  date?: HistoricalDateModel;
  description?: string;
  text?: string;
  references?: DocReference[];
}

/**
 * The CodEdits part model.
 */
export interface CodEditsPart extends Part {
  edits: CodEdit[];
}

/**
 * The type ID used to identify the CodEditsPart type.
 */
export const COD_EDITS_PART_TYPEID = 'it.vedph.codicology.edits';

/**
 * JSON schema for the CodEdits part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_EDITS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/codicology/' + COD_EDITS_PART_TYPEID + '.json',
  type: 'object',
  title: 'CodEditsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'edits',
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
    edits: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['type'],
            properties: {
              eid: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
              tag: {
                type: 'string',
              },
              authorIds: {
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
              description: {
                type: 'string',
              },
              text: {
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
        ],
      },
    },
  },
};

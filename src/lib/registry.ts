// type definitions
export type Primitives = { boolean: boolean; number: number; string: string; date: Date; url: URL };
export type Primitive = keyof Primitives;

// selectors type definitions
export type Selector = {
  type: `${Primitive}[]` | Primitive;
  selector: string;
  attribute?: string;
  regex?: RegExp;
};

export type SelectorShape =
  | { shape: { root: Selector } & Selectors; type: "object[]" }
  | { shape: Selectors; type: "object" };

export type Selectors = { [key: string]: Selector | SelectorShape };

// registry type definitions
export type QueryShape = { type: Primitive; pattern?: RegExp; required?: boolean };

export type Registry = {
  path: string;
  item: { fields: Selectors; columns?: Selectors };
  list: { query: Record<string, QueryShape>; fields: Selectors };
};

// inference helpers
export type ExtractPrimitive<T extends Primitive> = Primitives[T];
export type ExtractQuery<T extends QueryShape> = T["type"];

type RequiredKeys<T> = { [K in keyof T]: T[K] extends { required: true } ? K : never }[keyof T];

export type InferQuery<R extends Registry> = Partial<{
  [K in keyof R["list"]["query"]]: ExtractPrimitive<ExtractQuery<R["list"]["query"][K]>>;
}> & {
  [K in RequiredKeys<R["list"]["query"]>]: ExtractPrimitive<ExtractQuery<R["list"]["query"][K]>>;
};

export type InferSelectors<T extends Selectors> = { [K in keyof T]: InferSelector<T[K]> };
export type InferSelector<T> = T extends { type: infer U }
  ? U extends keyof Primitives
    ? Primitives[U]
    : U extends `${infer Base}[]`
      ? Base extends keyof Primitives
        ? Primitives[Base][]
        : Base extends "object"
          ? InferSelectors<T extends SelectorShape ? T["shape"] : never>[]
          : never
      : U extends "object"
        ? InferSelectors<T extends SelectorShape ? T["shape"] : never>
        : never
  : never;

export type InferColumns<R extends Registry> = R["item"] extends { columns: Selectors }
  ? { [K in keyof R["item"]["columns"]]: InferSelector<R["item"]["columns"][K]> }
  : object;

export type InferSelectedColumns<R extends Registry, C extends Array<keyof InferColumns<R>>> = {
  [K in C[number]]: InferColumns<R>[K];
};

export type InferItem<
  R extends Registry,
  C extends Array<keyof InferColumns<R>> | undefined = undefined,
> = InferSelectors<R["item"]["fields"]> &
  (C extends Array<unknown> ? InferSelectedColumns<R, C> : InferColumns<R>);

export type InferList<R extends Registry> = InferSelectors<R["list"]["fields"]>;

// endpoint registry definitions
export const character = {
  item: {
    columns: {
      achievement: {
        shape: {
          score: { selector: ".achievement__point", type: "number" },
          total: { regex: /^(?<name>\d+)/, selector: ".parts__total", type: "number" },
        },
        type: "object",
      },
      faceaccessory: {
        selector: ".faceaccessory__sort__total > span:nth-child(1)",
        type: "number",
      },
      minion: { selector: ".minion__sort__total > span:nth-child(1)", type: "number" },
      mount: { selector: ".minion__sort__total > span:nth-child(1)", type: "number" },
    },
    fields: {
      avatar: {
        attribute: "src",
        selector: ".frame__chara__face > img:nth-child(1)",
        type: "url",
      },
      bio: { selector: ".character__selfintroduction", type: "string" },
      data_center: {
        regex: /\[(?<datacenter>\w+)]/,
        selector: ".frame__chara__world",
        type: "string",
      },
      free_company: {
        shape: {
          crest: {
            attribute: "src",
            selector: "div.character__freecompany__crest > div > img",
            type: "url[]",
          },
          id: {
            attribute: "href",
            regex: /lodestone\/freecompany\/(?<id>\d+)\//,
            selector: ".character__freecompany__name > h4:nth-child(2) > a:nth-child(1)",
            type: "string",
          },
          name: {
            selector: ".character__freecompany__name > h4:nth-child(2) > a:nth-child(1)",
            type: "string",
          },
        },
        type: "object",
      },
      grand_company: {
        shape: {
          name: {
            regex: /^(?<name>[^/]+)/,
            selector: "div.character-block:nth-child(4) > div:nth-child(2) > p:nth-child(2)",
            type: "string",
          },
          rank: {
            regex: /\/\s*(?<rank>.+)$/,
            selector: "div.character-block:nth-child(4) > div:nth-child(2) > p:nth-child(2)",
            type: "string",
          },
        },
        type: "object",
      },
      id: {
        attribute: "href",
        regex: /lodestone\/character\/(?<id>\d+)\//,
        selector: ".frame__chara__link",
        type: "string",
      },
      name: {
        selector: "div.frame__chara__box:nth-child(2) > .frame__chara__name",
        type: "string",
      },
      portrait: {
        attribute: "src",
        selector: ".js__image_popup > img:nth-child(1)",
        type: "url",
      },
      pvp_team: {
        shape: {
          crest: {
            attribute: "src",
            selector: ".character__pvpteam__crest__image > img",
            type: "url[]",
          },
          id: {
            attribute: "href",
            regex: /lodestone\/pvpteam\/(?<id>[\da-z]+)\//,
            selector: ".character__pvpteam__name > h4 > a",
            type: "string",
          },
          name: { selector: ".character__pvpteam__name > h4 > a", type: "string" },
        },
        type: "object",
      },
      title: { selector: ".frame__chara__title", type: "string" },
      world_name: { regex: /^(?<world>\w+)/, selector: ".frame__chara__world", type: "string" },
    },
  },
  list: {
    fields: {
      avatar: { attribute: "src", selector: ".entry__chara__face > img", type: "url" },
      data_center: { regex: /\[(?<datacenter>\w+)]/, selector: ".entry__world", type: "string" },
      grand_company: {
        shape: {
          name: {
            attribute: "data-tooltip",
            regex: /^(?<name>[^/]+)/,
            selector: ".entry__chara_info > .js__tooltip",
            type: "string",
          },
          rank: {
            attribute: "data-tooltip",
            regex: /\/\s*(?<rank>.+)$/,
            selector: ".entry__chara_info > .js__tooltip",
            type: "string",
          },
        },
        type: "object",
      },
      id: {
        attribute: "href",
        regex: /lodestone\/character\/(?<id>\d+)\//,
        selector: ".entry__link",
        type: "string",
      },
      name: { selector: ".entry__name", type: "string" },
      world_name: { regex: /^(?<world>\w+)/, selector: ".entry__world", type: "string" },
    },
    query: {
      blog_lang: { pattern: /^(?:ja|en|de|fr)$/, type: "string" },
      classjob: {
        pattern: /^(?:\d+|_job_(?:TANK|HEALER|MELEE|RANGED|CASTER|GATHERER|CRAFTER))$/,
        type: "string",
      },
      gcid: { pattern: /^[1-3]$/, type: "string" },
      order: { pattern: /^[18]?$/, type: "string" },
      q: { required: true, type: "string" },
      race_tribe: { pattern: /^(?:race_\d+|tribe_\d+)$/, type: "string" },
      worldname: { pattern: /^(?:_dc_[A-Za-z]+|_region_[1-4]|[A-Za-z]+)$/, type: "string" },
    },
  },
  path: "character",
} satisfies Registry;

export const cwls = {
  item: {
    fields: {
      data_center: { selector: ".heading__cwls__dcname", type: "string" },
      formed: {
        regex: /ldst_strftime\((\d+),/,
        selector: ".heading__cwls__formed > script",
        type: "date",
      },
      members: {
        regex: /(?<total>\d+)/,
        selector: "div.cf-member-list > .parts__total",
        type: "number",
      },
      name: { regex: /\s*(?<name>.+)/, selector: ".heading__linkshell__name", type: "string" },
    },
  },
  list: {
    fields: {
      data_center: { selector: ".entry__world", type: "string" },
      id: {
        attribute: "href",
        regex: /lodestone\/crossworld_linkshell\/(?<id>.+)\//,
        selector: ".entry__link--line",
        type: "string",
      },
      members: { selector: ".entry__linkshell__member > div > span", type: "string" },
      name: { selector: ".entry__name", type: "string" },
    },
    query: {
      cf_public: { type: "boolean" },
      character_count: { pattern: /^(?:\d+-\d+|\d+-)$/, type: "string" },
      dcname: { pattern: /^(?:_dc_[A-Za-z]+|_region_[1-4])$/, type: "string" },
      order: { pattern: /^[16]?$/, type: "string" },
      q: { required: true, type: "string" },
    },
  },
  path: "crossworld_linkshell",
} satisfies Registry;

export const freecompany = {
  item: {
    fields: {
      crest: {
        attribute: "src",
        selector:
          "div.ldst__window:nth-child(1) > div:nth-child(2) > a:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > img",
        type: "url[]",
      },
      data_center: {
        regex: /\[(?<datacenter>\w+)]/,
        selector: "p.entry__freecompany__gc:nth-child(2)",
        type: "string",
      },
      estate: {
        shape: {
          greeting: { selector: ".freecompany__estate__greeting", type: "string" },
          name: { selector: ".freecompany__estate__name", type: "string" },
          plot: { selector: ".freecompany__estate__text", type: "string" },
        },
        type: "object",
      },
      formed: {
        regex: /ldst_strftime\((\d+),/,
        selector: "p.freecompany__text:nth-of-type(5) > script",
        type: "date",
      },
      grand_company: {
        shape: {
          name: {
            regex: /^(?<name>[^/]+)/,
            selector: "p.entry__freecompany__gc:nth-child(1)",
            type: "string",
          },
          rank: {
            regex: /\/\s*(?<rank>.+)$/,
            selector: "p.entry__freecompany__gc:nth-child(1)",
            type: "string",
          },
        },
        type: "object",
      },
      id: {
        regex: /lodestone\/freecompany\/(?<id>\d+)\//,
        selector: "a.entry__freecompany",
        type: "string",
      },
      members: { selector: "p.freecompany__text:nth-of-type(6)", type: "number" },
      name: { selector: "p.entry__freecompany__name", type: "string" },
      rank: { selector: "p.freecompany__text:nth-of-type(7)", type: "number" },
      rankings: {
        shape: {
          monthly: {
            regex: /Monthly Rank:(?<rank>\d+)/,
            selector: ".character__ranking__data tr:nth-child(2) > th:nth-child(1)",
            type: "number",
          },
          weekly: {
            regex: /Weekly Rank:(?<rank>\d+)/,
            selector: ".character__ranking__data tr:nth-child(1) > th:nth-child(1)",
            type: "number",
          },
        },
        type: "object",
      },
      slogan: { selector: ".freecompany__text__message", type: "string" },
      tag: { selector: ".freecompany__text.freecompany__text__tag", type: "string" },
      world_name: {
        regex: /^(?<world>\w+)/,
        selector: "p.entry__freecompany__gc:nth-child(2)",
        type: "string",
      },
    },
  },
  list: {
    fields: {
      crest: {
        attribute: "src",
        selector: ".entry__freecompany__crest__image > img",
        type: "url[]",
      },
      data_center: {
        regex: /\[(?<datacenter>\w+)]/,
        selector: ".entry__world:nth-child(3)",
        type: "string",
      },
      formed: {
        regex: /ldst_strftime\((\d+),/,
        selector: ".entry__freecompany__fc-day > script",
        type: "date",
      },
      grand_company: {
        shape: {
          name: {
            regex: /^(?<name>[^/]+)/,
            selector: "p.entry__freecompany__gc:nth-child(1)",
            type: "string",
          },
        },
        type: "object",
      },
      has_estate: { selector: ".entry__freecompany__fc-housing", type: "boolean" },
      id: {
        attribute: "href",
        regex: /lodestone\/freecompany\/(?<id>\d+)\//,
        selector: ".entry__block",
        type: "string",
      },
      members: { selector: ".entry__freecompany__fc-member", type: "number" },
      name: { selector: ".entry__name", type: "string" },
      world_name: {
        regex: /^(?<world>\w+)/,
        selector: ".entry__world:nth-child(3)",
        type: "string",
      },
    },
    query: {
      activetime: { pattern: /^[1-3]$/, type: "string" },
      activities: { pattern: /^(?:-1|[0-8])$/, type: "string" },
      cf_public: { type: "boolean" },
      character_count: { pattern: /^(?:\d+-\d+|\d+-)$/, type: "string" },
      gcid: { pattern: /^[1-3]$/, type: "string" },
      house: { pattern: /^[0-2]$/, type: "string" },
      join: { type: "boolean" },
      order: { pattern: /^[16]?$/, type: "string" },
      q: { required: true, type: "string" },
      roles: { pattern: /^(?:-1|1[6-9]|20)$/, type: "string" },
      worldname: { pattern: /^(?:_dc_[A-Za-z]+|_region_[1-4]|[A-Za-z]+)$/, type: "string" },
    },
  },
  path: "freecompany",
} satisfies Registry;

export const linkshell = {
  item: {
    fields: {
      data_center: { regex: /\[(?<datacenter>\w+)]/, selector: ".entry__world", type: "string" },
      members: {
        regex: /(?<total>\d+)/,
        selector: "div.cf-member-list > .parts__total",
        type: "number",
      },
      name: { regex: /\s*(?<name>.+)/, selector: ".heading__linkshell__name", type: "string" },
      world_name: { regex: /^(?<world>\w+)/, selector: ".entry__world", type: "string" },
    },
  },
  list: {
    fields: {
      data_center: { regex: /\[(?<datacenter>\w+)]/, selector: ".entry__world", type: "string" },
      id: {
        attribute: "href",
        regex: /lodestone\/linkshell\/(?<id>.+)\//,
        selector: ".entry__block",
        type: "string",
      },
      members: {
        regex: /(?<total>\d+)/,
        selector: ".entry__linkshell__member > div > span",
        type: "number",
      },
      name: { selector: ".entry__name", type: "string" },
      world_name: { regex: /^(?<world>\w+)/, selector: ".entry__world", type: "string" },
    },
    query: {
      cf_public: { type: "boolean" },
      character_count: { pattern: /^(?:\d+-\d+|\d+-)$/, type: "string" },
      order: { pattern: /^[16]?$/, type: "string" },
      q: { required: true, type: "string" },
      worldname: { pattern: /^(?:_region_[1-4]|[A-Za-z]+)$/, type: "string" },
    },
  },
  path: "linkshell",
} satisfies Registry;

export const pvpteam = {
  item: {
    fields: {
      crest: {
        attribute: "src",
        selector: ".entry__pvpteam__crest__image > img",
        type: "url[]",
      },
      data_center: { selector: ".entry__pvpteam__name--dc", type: "string" },
      formed: {
        regex: /ldst_strftime\((\d+),/,
        selector: ".entry__pvpteam__data--formed > script",
        type: "date",
      },
      name: { selector: ".entry__pvpteam__name--team", type: "string" },
    },
  },
  list: {
    fields: {
      crest: {
        attribute: "src",
        selector: ".entry__pvpteam__search__crest__image > img",
        type: "url[]",
      },
      data_center: { selector: ".entry__world", type: "string" },
      id: {
        attribute: "href",
        regex: /lodestone\/pvpteam\/(?<id>.+)\//,
        selector: ".entry__link",
        type: "string",
      },
      name: { selector: ".entry__name", type: "string" },
    },
    query: {
      cf_public: { type: "boolean" },
      dcname: { pattern: /^(?:_dc_[A-Za-z]+|_region_[1-4])$/, type: "string" },
      order: { pattern: /^[16]?$/, type: "string" },
      q: { required: true, type: "string" },
    },
  },
  path: "pvpteam",
} satisfies Registry;

export type Character = typeof character;
export type CWLS = typeof cwls;
export type Freecompany = typeof freecompany;
export type Linkshell = typeof linkshell;
export type PvpTeam = typeof pvpteam;

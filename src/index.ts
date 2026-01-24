import { parseHTML } from "linkedom/worker";
import LodestoneError from "./error.js";

const BASE_URL = "https://%s.finalfantasyxiv.com/lodestone/";

// type definitions
export type Locales = "de" | "eu" | "fr" | "jp" | "na";
export type LodestoneOptions = { headers?: Record<string, string>; locale?: Locales };
export type NumberResolvable = number | string;

type ExtractPrimitive<T> = T extends Primitive
  ? T
  : T extends { type: infer P extends Primitive }
    ? P
    : never;

type InferColumns<R extends Registry> = R["item"]["columns"] extends Selectors
  ? { [K in keyof R["item"]["columns"]]: InferSelector<R["item"]["columns"][K]> }
  : never;

type InferItem<R extends Registry> = InferSelectors<R["item"]["fields"]>;

type InferList<R extends Registry> = InferSelectors<R["list"]["fields"]>;

type InferQuery<R extends Registry> = {
  [K in OptionalKeys<R["list"]["query"]>]?: MapPrimitive<ExtractPrimitive<R["list"]["query"][K]>>;
} & {
  [K in RequiredKeys<R["list"]["query"]>]: MapPrimitive<ExtractPrimitive<R["list"]["query"][K]>>;
};

type InferSelector<T> = T extends { type: infer U }
  ? U extends keyof PrimitiveMap
    ? PrimitiveMap[U]
    : U extends `${infer Base}[]`
      ? Base extends keyof PrimitiveMap
        ? PrimitiveMap[Base][]
        : Base extends "object"
          ? InferSelectors<T extends SelectorShapeDef ? T["shape"] : never>[]
          : never
      : U extends "object"
        ? InferSelectors<T extends SelectorShapeDef ? T["shape"] : never>
        : never
  : never;
type InferSelectors<T extends Selectors> = { [K in keyof T]: InferSelector<T[K]> };

type MapPrimitive<T extends Primitive> = PrimitiveMap[T];

type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

// registry type definitions
type Primitive = "boolean" | "number" | "string";
// type inference helpers
type PrimitiveMap = { boolean: boolean; number: number; string: string };

type Registry = {
  item: { columns?: Selectors; fields: Selectors };
  list: {
    fields: Selectors;
    query: { [key: string]: Primitive | RegExp | { required: boolean; type: Primitive | RegExp } };
  };
  path: string;
};

type RequiredKeys<T> = { [K in keyof T]: T[K] extends { required: true } ? K : never }[keyof T];

type SelectorDef = {
  readonly attribute?: string;
  readonly regex?: RegExp;
  readonly selector: string;
  readonly type: `${Primitive}[]` | Primitive;
};
type Selectors = { [key: string]: SelectorDef | SelectorShapeDef };

type SelectorShapeDef =
  | { shape: Selectors & { root: SelectorDef }; type: "object[]" }
  | { shape: Selectors; type: "object" };

// registry definitions
export const registry = {
  character: {
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
          type: "string",
        },
        bio: { selector: ".character__selfintroduction", type: "string" },
        data_center: {
          regex: /\[(?<datacenter>\w+)\]/,
          selector: ".frame__chara__world",
          type: "string",
        },
        free_company: {
          shape: {
            crest: {
              attribute: "src",
              selector: "div.character__freecompany__crest > div > img",
              type: "string[]",
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
          type: "string",
        },
        pvp_team: {
          shape: {
            crest: {
              attribute: "src",
              selector: ".character__pvpteam__crest__image > img",
              type: "string[]",
            },
            id: {
              attribute: "href",
              regex: /lodestone\/pvpteam\/(?<id>[a-z0-9]+)\//,
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
        avatar: { attribute: "src", selector: ".entry__chara__face > img", type: "string" },
        data_center: { regex: /\[(?<datacenter>\w+)\]/, selector: ".entry__world", type: "string" },
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
        blog_lang: /^(?:ja|en|de|fr)$/,
        classjob: /^(?:\d+|_job_(?:TANK|HEALER|MELEE|RANGED|CASTER|GATHERER|CRAFTER))$/,
        gcid: /^[123]$/,
        order: /^(?:1|8)?$/,
        q: { required: true, type: "string" },
        race_tribe: /^(?:race_\d+|tribe_\d+)$/,
        worldname: /^(?:_dc_[A-Za-z]+|_region_[1-4]|[A-Za-z]+)$/,
      },
    },
    path: "character",
  },
  cwls: {
    item: {
      fields: {
        data_center: { selector: ".heading__cwls__dcname", type: "string" },
        formed: {
          regex: /ldst_strftime\((\d+),/,
          selector: ".heading__cwls__formed > script",
          type: "string",
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
        cf_public: "boolean",
        character_count: /^(?:\d+-\d+|\d+-)$/,
        dcname: /^(?:_dc_[A-Za-z]+|_region_[1-4])$/,
        order: /^(?:1|6)?$/,
        q: { required: true, type: "string" },
      },
    },
    path: "crossworld_linkshell",
  },
  freecompany: {
    item: {
      fields: {
        crest: {
          attribute: "src",
          selector:
            "div.ldst__window:nth-child(1) > div:nth-child(2) > a:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > img",
          type: "string[]",
        },
        data_center: {
          regex: /\[(?<datacenter>\w+)\]/,
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
          type: "string",
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
          type: "string[]",
        },
        data_center: {
          regex: /\[(?<datacenter>\w+)\]/,
          selector: ".entry__world:nth-child(3)",
          type: "string",
        },
        formed: {
          regex: /ldst_strftime\((\d+),/,
          selector: ".entry__freecompany__fc-day > script",
          type: "string",
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
        activetime: /^[1-3]$/,
        activities: /^(?:-1|[0-8])$/,
        cf_public: "boolean",
        character_count: /^(?:\d+-\d+|\d+-)$/,
        gcid: /^[123]$/,
        house: /^[0-2]$/,
        join: "boolean",
        order: /^(?:1|6)?$/,
        q: { required: true, type: "string" },
        roles: /^(?:-1|1[6-9]|20)$/,
        worldname: /^(?:_dc_[A-Za-z]+|_region_[1-4]|[A-Za-z]+)$/,
      },
    },
    path: "freecompany",
  },
  linkshell: {
    item: {
      fields: {
        data_center: { regex: /\[(?<datacenter>\w+)\]/, selector: ".entry__world", type: "string" },
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
        data_center: { regex: /\[(?<datacenter>\w+)\]/, selector: ".entry__world", type: "string" },
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
        cf_public: "boolean",
        character_count: /^(?:\d+-\d+|\d+-)$/,
        order: /^(?:1|6)?$/,
        q: { required: true, type: "string" },
        worldname: /^(?:_region_[1-4]|[A-Za-z]+)$/,
      },
    },
    path: "linkshell",
  },
  pvpteam: {
    item: {
      fields: {
        crest: {
          attribute: "src",
          selector: ".entry__pvpteam__crest__image > img",
          type: "string[]",
        },
        data_center: { selector: ".entry__pvpteam__name--dc", type: "string" },
        formed: {
          regex: /ldst_strftime\((\d+),/,
          selector: ".entry__pvpteam__data--formed > script",
          type: "string",
        },
        name: { selector: ".entry__pvpteam__name--team", type: "string" },
      },
    },
    list: {
      fields: {
        crest: {
          attribute: "src",
          selector: ".entry__pvpteam__search__crest__image > img",
          type: "string[]",
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
        cf_public: "boolean",
        dcname: /^(?:_dc_[A-Za-z]+|_region_[1-4])$/,
        order: /^(?:1|4)?$/,
        q: { required: true, type: "string" },
      },
    },
    path: "pvpteam",
  },
} satisfies Record<string, Registry>;

// lodestone client
export type Character = typeof registry.character;

export type CWLS = typeof registry.cwls;
export type Freecompany = typeof registry.freecompany;

export type InferEndpointItem<E> = E extends Endpoint<infer R> ? InferItem<R> : never;

export type InferEndpointList<E> = E extends Endpoint<infer R> ? InferList<R>[] : never;
export type Linkshell = typeof registry.linkshell;
export type PvPTeam = typeof registry.pvpteam;

// endpoint definitions
type EndpointOptions<R extends Registry> = LodestoneOptions & {
  columns?: R["item"]["columns"] extends Selectors ? (keyof R["item"]["columns"])[] : never;
};
/**
 * A Generic Lodestone endpoint
 * @since 0.1.0
 */
class Endpoint<R extends Registry> {
  public constructor(
    protected readonly registry: R,
    protected options?: EndpointOptions<R>
  ) {}

  /**
   * Performs a Lodestone-style search.
   * @param {InferQuery<R>} query Fully type-safe and inferred search parameters defined by the registry. These correspond directly to Lodestone's own search filters.
   * @param {Omit<EndpointOptions<R>, "columns">} [options] Optional locale or header overrides.
   * @returns {Promise<InferList<R>[] | null>} An array of parsed search results, or `null` if Lodestone reports that no entries match the query.
   * @since 0.1.0
   */
  public async find(
    query: InferQuery<R>,
    options: Omit<EndpointOptions<R>, "columns"> = {}
  ): Promise<InferList<R>[] | null> {
    const params = new URLSearchParams(this.stringify(query)).toString();
    const res = await this.req(this.registry.path + "?" + params, options);
    if (res.status === 404) return null;
    this.check(res);

    const { document } = parseHTML(await res.text());
    if (!document || document.querySelector(".parts__zero")) return null;

    const entries = Array.from(document.querySelectorAll("div.entry"));
    const results = entries
      .map((el) => this.extract(el, this.registry.list.fields))
      .filter((v) => v.id !== null);

    return results as InferList<R>[];
  }

  /**
   * Fetch a single Lodestone item by an ID.
   * @param {NumberResolvable} id The unique identifier for the item
   * @param {EndpointOptions<R>} [options] Optional overrides for locale, headers or requested columns.
   * @returns {Promise<(InferItem<R> & Partial<InferColumns<R>>) | null>} Parsed item fields, or `null` if the page does not exist.
   * @since 0.1.0
   */
  public async get(
    id: NumberResolvable,
    options: EndpointOptions<R> = {}
  ): Promise<(InferItem<R> & Partial<InferColumns<R>>) | null> {
    const { columns, ...rest } = options;
    const res = await this.req([this.registry.path, id.toString()], rest);
    if (res.status === 404) return null;
    this.check(res);

    const { document } = parseHTML(await res.text());
    if (!document || document.querySelector(".parts__zero")) return null;

    const fields = this.extract(document, this.registry.item.fields) as InferItem<R> &
      Partial<InferColumns<R>>;

    if (columns && this.registry.item.columns) {
      for (const key of columns) {
        const res = await this.req([this.registry.path, id.toString(), key as string], rest);
        if (res.status === 404) continue;
        this.check(res);

        const { document } = parseHTML(await res.text());
        if (!document || document.querySelector(".parts__zero")) continue;

        const def = this.registry.item.columns[key as string];
        if (!def) continue;

        if (!("shape" in def)) {
          // @ts-expect-error 2862 - generic typings overlapping
          fields[key] = this.extract(document, { value: def }).value;
        } else if (def.type === "object") {
          // @ts-expect-error 2862 - generic typings overlapping
          fields[key as string] = this.extract(document, def?.shape);
        } else {
          const rootSelector = def.shape.root.selector;
          const nodes = Array.from(document.querySelectorAll(rootSelector));
          // @ts-expect-error 2862 - generic typings overlapping
          fields[key as string] = nodes.map((node) => this.extract(node, def.shape));
        }
      }
    }

    return fields as InferItem<R> & Partial<InferColumns<R>>;
  }

  protected check(res: Response): void {
    switch (res.status) {
      case 200:
        return;
      case 302:
        throw new LodestoneError("Lodestone redirected the request, likely due to maintenance.");
      case 503:
        throw new LodestoneError("Lodestone is currently under maintenance.");
      default:
        if (res.status >= 500) {
          throw new LodestoneError(`Lodestone server error (${res.status}).`);
        }
        if (res.status >= 400) {
          throw new LodestoneError(`Request failed with status ${res.status}.`);
        }
    }
  }

  protected stringify<T extends Record<string, unknown>>(query: T): Record<string, string> {
    return Object.entries(query).reduce(
      (result, [key, value]) => {
        if (value === undefined || value === null) return result;
        result[key] = typeof value === "boolean" ? (value ? "1" : "0") : String(value);
        return result;
      },
      {} as Record<string, string>
    );
  }

  private extract<T extends Selectors>(el: Document | Element, selectors: T): InferSelectors<T> {
    const result: Record<string, unknown> = {};

    for (const [key, def] of Object.entries(selectors)) {
      if ("shape" in def) {
        if (def.type === "object") {
          result[key] = this.extract(el, def.shape);
        } else {
          const nodes = Array.from(el.querySelectorAll(def.shape.root.selector));
          result[key] = nodes.map((node) => this.extract(node, def.shape));
        }
        continue;
      }

      const isArray = def.type.endsWith("[]");
      const type = isArray ? (def.type.replace("[]", "") as Primitive) : def.type;

      if (isArray) {
        const nodes = Array.from(el.querySelectorAll(def.selector));
        const values = nodes.map((node) => {
          let v = def.attribute
            ? (node.getAttribute(def.attribute) ?? "")
            : (node.textContent?.trim() ?? "");

          if (def.regex) {
            const match = v.match(def.regex);
            if (match?.groups) {
              const groupName = Object.keys(match.groups)[0];
              v = match.groups[groupName] ?? "";
            } else {
              v = match?.[1] ?? "";
            }
          }

          if (type === "number") return Number(v);
          if (type === "boolean") return v === "1" || v === "true";
          return v;
        });

        result[key] = values;
        continue;
      }

      const element = el.querySelector(def.selector);
      if (!element) {
        result[key] = null;
        continue;
      }

      let value = def.attribute
        ? (element.getAttribute(def.attribute) ?? "")
        : (element.textContent?.trim() ?? "");

      if (def.regex) {
        const match = value.match(def.regex);
        if (match?.groups) {
          const groupName = Object.keys(match.groups)[0];
          value = match.groups[groupName] ?? "";
        } else {
          value = match?.[1] ?? "";
        }
      }

      if (type === "number") result[key] = Number(value);
      else if (type === "boolean") result[key] = value === "1" || value === "true";
      else result[key] = value;
    }
    return result as InferSelectors<T>;
  }

  private async req(path: string | string[], options?: LodestoneOptions): Promise<Response> {
    const { headers = {}, locale = "na" } = options ?? this.options!;

    for (const [key, value] of Object.entries(headers ?? {})) {
      headers[key.toLowerCase()] = String(value);
    }

    const baseUA = "curl/0.1.0 (+https://github.com/miichom/lodestone)";
    headers["user-agent"] = headers["user-agent"] ? `${baseUA} ${headers["user-agent"]}` : baseUA;

    if (Array.isArray(path)) path = path.join("/");
    const url = BASE_URL.replace("%s", locale) + path.replace(/^\/+/, "");
    return fetch(url, { headers, method: "GET", redirect: "follow" });
  }
}

export class Client {
  public readonly character: Endpoint<Character>;
  public readonly cwls: Endpoint<CWLS>;
  public readonly freecompany: Endpoint<Freecompany>;
  public readonly linkshell: Endpoint<Linkshell>;
  public readonly pvpteam: Endpoint<PvPTeam>;

  /**
   * @since 0.1.0
   * @param {LodestoneOptions} [options]
   */
  constructor(options: LodestoneOptions = {}) {
    this.character = new Endpoint(registry.character, options);
    this.cwls = new Endpoint(registry.cwls, options);
    this.freecompany = new Endpoint(registry.freecompany, options);
    this.linkshell = new Endpoint(registry.linkshell, options);
    this.pvpteam = new Endpoint(registry.pvpteam, options);
  }
}

export default Client;

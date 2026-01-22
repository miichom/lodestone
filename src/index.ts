import { URLSearchParams } from "url";
import { parseHTML } from "linkedom/worker";
import LodestoneError from "./error.js";

const BASE_URL = "https://%s.finalfantasyxiv.com/lodestone/";

// type definitions
export type Locales = "de" | "eu" | "fr" | "jp" | "na";
export type NumberResolvable = string | number;
export type LodestoneOptions = { locale?: Locales; headers?: Record<string, string> };

// registry type definitions
type Primitive = "string" | "number" | "boolean";

type SelectorDef = {
  readonly type: Primitive | `${Primitive}[]`;
  readonly selector: string;
  readonly attribute?: string;
  readonly regex?: RegExp;
};

type SelectorShapeDef =
  | { type: "object"; shape: Selectors }
  | { type: "object[]"; shape: Selectors & { root: SelectorDef } };

type Selectors = { [key: string]: SelectorDef | SelectorShapeDef };

type Registry = {
  path: string;
  item: { fields: Selectors; columns?: Selectors };
  list: {
    query: { [key: string]: { type: Primitive; required: boolean } | Primitive };
    fields: Selectors;
  };
};

// type inference helpers
type PrimitiveMap = { string: string; number: number; boolean: boolean };
type MapPrimitive<T extends Primitive> = PrimitiveMap[T];

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

type InferItem<R extends Registry> = InferSelectors<R["item"]["fields"]>;
type InferColumns<R extends Registry> = R["item"]["columns"] extends Selectors
  ? { [K in keyof R["item"]["columns"]]: InferSelector<R["item"]["columns"][K]> }
  : never;

type InferList<R extends Registry> = InferSelectors<R["list"]["fields"]>;

type ExtractPrimitive<T> = T extends Primitive
  ? T
  : T extends { type: infer P extends Primitive }
    ? P
    : never;

type RequiredKeys<T> = { [K in keyof T]: T[K] extends { required: true } ? K : never }[keyof T];
type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

type InferQuery<R extends Registry> = {
  [K in RequiredKeys<R["list"]["query"]>]: MapPrimitive<ExtractPrimitive<R["list"]["query"][K]>>;
} & {
  [K in OptionalKeys<R["list"]["query"]>]?: MapPrimitive<ExtractPrimitive<R["list"]["query"][K]>>;
};

// registry definitions
export const registry = {
  character: {
    path: "character",
    item: {
      fields: {
        id: {
          type: "string",
          selector: ".frame__chara__link",
          attribute: "href",
          regex: /lodestone\/character\/(?<id>\d+)\//,
        },
        name: {
          type: "string",
          selector: "div.frame__chara__box:nth-child(2) > .frame__chara__name",
        },
        avatar: {
          type: "string",
          selector: ".frame__chara__face > img:nth-child(1)",
          attribute: "src",
        },
        portrait: {
          type: "string",
          selector: ".js__image_popup > img:nth-child(1)",
          attribute: "src",
        },
        world_name: { type: "string", selector: ".frame__chara__world", regex: /^(?<world>\w+)/ },
        data_center: {
          type: "string",
          selector: ".frame__chara__world",
          regex: /\[(?<datacenter>\w+)\]/,
        },
        title: { type: "string", selector: ".frame__chara__title" },
        bio: { type: "string", selector: ".character__selfintroduction" },
        grand_company: {
          type: "object",
          shape: {
            name: {
              type: "string",
              selector: "div.character-block:nth-child(4) > div:nth-child(2) > p:nth-child(2)",
              regex: /^(?<name>[^/]+)/,
            },
            rank: {
              type: "string",
              selector: "div.character-block:nth-child(4) > div:nth-child(2) > p:nth-child(2)",
              regex: /\/\s*(?<rank>.+)$/,
            },
          },
        },
        free_company: {
          type: "object",
          shape: {
            id: {
              type: "string",
              selector: ".character__freecompany__name > h4:nth-child(2) > a:nth-child(1)",
              attribute: "href",
              regex: /lodestone\/freecompany\/(?<id>\d+)\//,
            },
            name: {
              type: "string",
              selector: ".character__freecompany__name > h4:nth-child(2) > a:nth-child(1)",
            },
            crest: {
              type: "string[]",
              selector: "div.character__freecompany__crest > div > img",
              attribute: "src",
            },
          },
        },
        pvp_team: {
          type: "object",
          shape: {
            id: {
              type: "string",
              selector: ".character__pvpteam__name > h4 > a",
              attribute: "href",
              regex: /lodestone\/pvpteam\/(?<id>[a-z0-9]+)\//,
            },
            name: { type: "string", selector: ".character__pvpteam__name > h4 > a" },
            crest: {
              type: "string[]",
              selector: ".character__pvpteam__crest__image > img",
              attribute: "src",
            },
          },
        },
      },
      columns: {},
    },
    list: {
      query: { q: { type: "string", required: true }, worldname: "string" },
      fields: {
        id: {
          type: "string",
          selector: ".entry__link",
          attribute: "href",
          regex: /lodestone\/character\/(?<id>\d+)\//,
        },
        name: { type: "string", selector: ".entry__name" },
        avatar: { type: "string", selector: ".entry__chara__face > img", attribute: "src" },
        world_name: { type: "string", selector: ".entry__world", regex: /^(?<world>\w+)/ },
        data_center: { type: "string", selector: ".entry__world", regex: /\[(?<datacenter>\w+)\]/ },
        grand_company: {
          type: "object",
          shape: {
            name: {
              type: "string",
              selector: ".entry__chara_info > .js__tooltip",
              attribute: "data-tooltip",
              regex: /^(?<name>[^/]+)/,
            },
            rank: {
              type: "string",
              selector: ".entry__chara_info > .js__tooltip",
              attribute: "data-tooltip",
              regex: /\/\s*(?<rank>.+)$/,
            },
          },
        },
      },
    },
  },
} satisfies Record<string, Registry>;

// endpoint definitions
type EndpointOptions<R extends Registry> = LodestoneOptions & {
  columns?: R["item"]["columns"] extends Selectors ? (keyof R["item"]["columns"])[] : never;
};

export type InferEndpointItem<E> = E extends Endpoint<infer R> ? InferItem<R> : never;
export type InferEndpointList<E> = E extends Endpoint<infer R> ? InferList<R>[] : never;

class Endpoint<R extends Registry> {
  /**
   * @since 0.1.0
   * @param {R} registry
   * @param {EndpointOptions} [options]
   */
  public constructor(
    protected readonly registry: R,
    protected options?: EndpointOptions<R>
  ) {}

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

  private async req(path: string | string[], options?: LodestoneOptions): Promise<Response> {
    const { locale, headers } = options ?? this.options!;
    if (Array.isArray(path)) path = path.join("/");
    const url = BASE_URL.replace("%s", locale ?? "na") + path.replace(/^\/+/, "");
    return fetch(url, { method: "GET", headers, redirect: "follow" });
  }

  private extract<T extends Selectors>(el: Element | Document, selectors: T): InferSelectors<T> {
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

  /**
   * @since 0.1.0
   * @param {NumberResolvable} id
   * @param {EndpointOptions<R>} [options]
   * @returns {Promise<InferItem<R>>}
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
        const def = this.registry.item.columns[key as string];
        if (!def || !("shape" in def)) continue;
        if (def.type === "object") {
          // @ts-expect-error 2862 - generic typings overlapping
          fields[key as string] = this.extract(document, def.shape);
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

  /**
   * @since 0.1.0
   * @param {InferQuery<R>} query
   * @param {Omit<EndpointOptions<R>, "columns">} [options]
   * @returns {Promise<InferList<R>[]>}
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
}

// lodestone client
export type Character = typeof registry.character;

export class Client {
  public readonly character: Endpoint<Character>;

  /**
   * @since 0.1.0
   * @param {LodestoneOptions} [options]
   */
  constructor(options: LodestoneOptions = {}) {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(options.headers ?? {})) {
      headers[key.toLowerCase()] = String(value);
    }
    const baseUA = "curl/0.1.0 (+https://github.com/miichom/lodestone)";
    headers["user-agent"] = headers["user-agent"] ? `${baseUA} ${headers["user-agent"]}` : baseUA;

    const normalized: LodestoneOptions = { locale: options.locale ?? "na", headers };
    this.character = new Endpoint(registry.character, normalized);
  }
}

export default Client;

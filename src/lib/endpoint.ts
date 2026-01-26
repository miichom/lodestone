/* eslint-disable unicorn/no-null */
import { parseHTML } from "linkedom/worker";
import type {
  InferColumns,
  InferItem,
  InferList,
  InferQuery,
  InferSelectors,
  Primitive,
  Primitives,
  Registry,
  Selector,
  Selectors,
} from "./registry.js";

export type NumberResolvable = string | number;

/**
 * An extended {@link Error} to capture stack trace errors
 * @since 0.1.0
 */
export class LodestoneError extends Error {
  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this);
    this.name = "LodestoneError";
  }
}

export type EndpointOptions = { headers?: Record<string, string>; locale?: string };

export class Endpoint<R extends Registry> {
  /**
   * A generic Lodestone endpoint used to search and get items from Lodestone.
   * @param {T} registry The provided endpoint registry containing field selectors to obtain
   * @param {EndpointOptions<R>} [options] Default method options to use when fetching from Lodestone.
   * @since 0.1.0
   */
  constructor(
    protected readonly registry: R,
    protected readonly options?: EndpointOptions
  ) {}

  private check(response: Response): void {
    const { status } = response;
    if (status === 200) return;
    if (status === 302) throw new LodestoneError("Lodestone redirected the request.");
    if (status === 503) throw new LodestoneError("Lodestone is undergoing maintenance.");
    if (status >= 500) throw new LodestoneError(`Lodestone server error (${status}).`);
    if (status >= 400) throw new LodestoneError(`Request failed with status ${status}.`);
  }

  private async req(path: string, options?: EndpointOptions): Promise<Response> {
    const { headers: rawHeaders = {}, locale = "na" } = options ?? this.options!;
    const headers = Object.fromEntries(
      Object.entries(rawHeaders).map(([k, v]) => [k.toLowerCase(), String(v)])
    );

    const baseUA = "curl/0.1.0 (+https://github.com/miichom/lodestone)";
    headers["user-agent"] = headers["user-agent"] ? `${baseUA} ${headers["user-agent"]}` : baseUA;

    return fetch(
      `https://${locale}.finalfantasyxiv.com/lodestone/${this.registry.path}/${path.replace(/^\/+/, "")}`,
      { headers, method: "GET", redirect: "follow" }
    );
  }

  private async fetchDocument(path: string, options?: EndpointOptions): Promise<Document | null> {
    const response = await this.req(path, options);
    if (!response.ok || response.status === 404) return null;
    this.check(response);

    const { document } = parseHTML(await response.text());
    if (!document || document.querySelector(".parts__zero")) return null;
    return document;
  }

  private async fetchColumn(
    id: NumberResolvable,
    key: string,
    options?: EndpointOptions
  ): Promise<unknown | undefined> {
    const selector = this.registry.item.columns?.[key];
    if (!selector) return undefined;

    const document = await this.fetchDocument(`${id.toString()}/${key}`, options);
    if (!document) return undefined;

    if (!("shape" in selector)) return this.extract(document, { value: selector }).value;
    if (selector.type === "object") return this.extract(document, selector.shape);

    const root = selector.shape.root.selector;
    const nodes = [...document.querySelectorAll(root)];
    return nodes.map((node) => this.extract(node, selector.shape));
  }

  private isMissing = (value: unknown) => value === undefined || value === null;

  private isValid = (value: unknown, type: Primitive) => {
    switch (type) {
      case "number": {
        return typeof value === "number" || !Number.isNaN(Number(value));
      }
      case "boolean": {
        return typeof value === "boolean";
      }
      case "date": {
        return value instanceof Date || !Number.isNaN(Date.parse(String(value)));
      }
      case "url": {
        try {
          new URL(String(value));
          return true;
        } catch {
          return false;
        }
      }
      default: {
        return typeof value === "string";
      }
    }
  };

  private validate = (query: InferQuery<R>): void => {
    const schema = this.registry.list.query;

    for (const key of Object.keys(query)) {
      if (!(key in schema)) {
        throw new LodestoneError(`Unknown query parameter "${key}".`);
      }
    }

    for (const [key, shape] of Object.entries(schema)) {
      const value = query[key];
      if (shape.required && this.isMissing(value)) {
        throw new LodestoneError(`Missing required query parameter "${key}".`);
      }

      if (this.isMissing(value)) continue;

      if (!this.isValid(value, shape.type)) {
        throw new LodestoneError(`Query parameter "${key}" must be type ${shape.type}.`);
      } else if (shape.pattern && !shape.pattern.test(String(value))) {
        throw new LodestoneError(`Query parameter "${key}" does not match required pattern.`);
      }
    }
  };

  private getRawValue(element: Element, selector: Selector): string {
    return selector.attribute
      ? (element.getAttribute(selector.attribute) ?? "")
      : (element.textContent.trim() ?? "");
  }

  private applyRegex(value: string, selector: Selector): string {
    if (!selector.regex) return value;

    const match = value.match(selector.regex);
    if (!match) return "";

    if (match.groups) {
      const [first] = Object.keys(match.groups);
      return match.groups[first] ?? "";
    } else return match[1] ?? "";
  }

  private coerce<T extends Primitive>(value: string, type: T): Primitives[T] {
    switch (type) {
      case "boolean": {
        return (value === "1" || value === "true") as Primitives[T];
      }
      case "number": {
        return Number(value) as Primitives[T];
      }
      case "date": {
        return new Date(value) as Primitives[T];
      }
      case "url": {
        return new URL(value) as Primitives[T];
      }
      default: {
        return value as Primitives[T];
      }
    }
  }

  private extract<T extends Selectors>(dom: Document | Element, selectors: T): InferSelectors<T> {
    const out: Record<string, unknown> = {};

    for (const [key, sel] of Object.entries(selectors)) {
      if ("shape" in sel) {
        if (sel.type === "object") out[key] = this.extract(dom, sel.shape);
        else {
          const nodes = [...dom.querySelectorAll(sel.shape.root.selector)];
          out[key] = nodes.map((n) => this.extract(n, sel.shape));
        }
        continue;
      }

      const isArray = sel.type.endsWith("[]");
      const base = (isArray ? sel.type.slice(0, -2) : sel.type) as Primitive;

      if (isArray) {
        const nodes = [...dom.querySelectorAll(sel.selector)];
        out[key] = nodes.map((n) => {
          const raw = this.getRawValue(n, sel);
          const extracted = this.applyRegex(raw, sel);
          return this.coerce(extracted, base);
        });
        continue;
      }

      const node = dom.querySelector(sel.selector);
      if (!node) {
        out[key] = undefined;
        continue;
      }

      const raw = this.getRawValue(node, sel);
      const extracted = this.applyRegex(raw, sel);
      out[key] = this.coerce(extracted, base);
    }

    return out as InferSelectors<T>;
  }

  /**
   * @param {InferQuery<R>} query The raw query parameters used by the Lodestone search.
   * @param {EndpointOptions} [options] Optional method overrides.
   * @returns {Promise<InferList<R>[] | null>}
   * @since 0.1.0
   */
  public async find(
    query: InferQuery<R>,
    options: EndpointOptions = {}
  ): Promise<InferList<R>[] | null> {
    this.validate(query);

    const parameters = new URLSearchParams(
      Object.fromEntries(
        Object.entries(query)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [
            key,
            typeof value === "boolean" ? (value ? "1" : "0") : String(value),
          ])
      )
    ).toString();

    const document = await this.fetchDocument(
      `?${parameters}`,
      Object.assign(this.options ?? {}, options)
    );
    if (!document) return null;

    const entries = [...document.querySelectorAll("div.entry")];
    const results = entries
      .map((element) => this.extract(element, this.registry.list.fields))
      .filter((v) => v.id !== null || v.id !== undefined);

    return results as InferList<R>[];
  }

  /**
   * @param {NumberResolvable} id The unique identifier for the Lodestone item.
   * @param {EndpointOptions & { columns?: Array<keyof InferColumns<R>> }} [options] Optional method overrides.
   * @returns {Promise<(InferItem<R> & Partial<InferColumns<R>) | null>}
   * @since 0.1.0
   */
  public async get(
    id: NumberResolvable,
    options: EndpointOptions & { columns?: Array<keyof InferColumns<R>> } = {}
  ): Promise<(InferItem<R> & Partial<InferColumns<R>>) | null> {
    const { columns, ...rest } = Object.assign(this.options ?? {}, options);

    const document = await this.fetchDocument(id.toString(), rest);
    if (!document) return null;

    const fields = this.extract(document, this.registry.item.fields);
    if (columns && this.registry.item.columns) {
      for (const key of columns) {
        const value = await this.fetchColumn(id, String(key), rest);
        if (value !== undefined) fields[key as string] = value as Primitives;
      }
    }

    return fields as InferItem<R> & Partial<InferColumns<R>>;
  }
}

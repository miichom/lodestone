import type { EndpointOptions } from "./lib/endpoint.js";
import { Endpoint } from "./lib/endpoint.js";
import type { Character, CWLS, Freecompany, Linkshell, PvpTeam } from "./lib/registry.js";
import * as registry from "./lib/registry.js";

export class Lodestone {
  public readonly character: Endpoint<Character>;
  public readonly cwls: Endpoint<CWLS>;
  public readonly freecompany: Endpoint<Freecompany>;
  public readonly linkshell: Endpoint<Linkshell>;
  public readonly pvpteam: Endpoint<PvpTeam>;

  /**
   * @param {EndpointOptions} [options] Default method options to use when fetching from Lodestone.
   * @example
   * ```ts
   * const lodestone = new Lodestone();
   *
   * const char = await lodestone.character.get(12345678);
   * // { id: '12345678', ... }
   * ```
   * @since 0.1.0
   */
  constructor(options: EndpointOptions = {}) {
    this.character = new Endpoint(registry.character, options);
    this.cwls = new Endpoint(registry.cwls, options);
    this.freecompany = new Endpoint(registry.freecompany, options);
    this.linkshell = new Endpoint(registry.linkshell, options);
    this.pvpteam = new Endpoint(registry.pvpteam, options);
  }
}

export default Lodestone;

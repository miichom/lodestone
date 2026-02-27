# @miichom/lodestone

[![npm](https://img.shields.io/npm/v/@miichom/lodestone.svg)](https://www.npmjs.com/package/@miichom/lodestone)
![node](https://img.shields.io/node/v/@miichom/lodestone)

A **minimal, fully typed [Lodestone](https://na.finalfantasyxiv.com/lodestone/) client** for _[Final Fantasy XIV](https://www.finalfantasyxiv.com/)_ that provides access to all **Lodestone endpoints** through a consistent, registry-driven API.

Designed for **server-side and edge runtimes**: [Node.js 20+](https://nodejs.org/), [Bun](https://bun.sh/), [Cloudflare Workers](https://developers.cloudflare.com/workers/), and [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).

<details>
<summary>Why chose <code>@miichom/lodestone</code>?</summary>

Many Lodestone scrapers rely on **DOM emulation** (e.g., [JSDOM](https://github.com/jsdom/jsdom), [cheerio](https://cheerio.js.org/)), which increases bundle size, slows cold starts, and often breaks in edge or serverless environments.

`@miichom/lodestone` avoids DOM entirely, relying on a **lightweight, schema-driven parser** that behaves consistently across all modern runtimes.

This approach is faster and more reliable than full DOM emulation, see [linkedom's benchmark rationale](https://github.com/WebReflection/linkedom?tab=readme-ov-file#why-is-this-better) for the technical details.

</details>

## Install

```bash
npm install @miichom/lodestone
```

## Example usage

```ts
import Lodestone from "@miichom/lodestone";

const client = new Lodestone();

// Fetch a character by ID
const character = await client.character.get(12345678);

// Fetch specific columns only
const partial = await client.character.get(12345678, {
  columns: ["mount"],
});

// Search for characters by name and world
const results = await client.character.find({
  q: "Y'shtola",
  worldname: "Twintania",
});
```

## Attribution

All _Final Fantasy XIV_ assets, including data accessed via the [Lodestone](https://na.finalfantasyxiv.com/lodestone/), are the intellectual property of &copy; [SQUARE ENIX CO., LTD.](https://www.square-enix.com/). This project is not affiliated with or endorsed by Square Enix.

## Contributing

Contributions, bug reports, and feature requests are welcome! See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for guidelines on how to get started.

## License

This project is licensed under the MIT License. See [`LICENSE.md`](./LICENSE.md) for details.

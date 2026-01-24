# @miichom/lodestone

[![npm](https://img.shields.io/npm/v/@miichom/lodestone.svg)](https://www.npmjs.com/package/@miichom/lodestone)
![node](https://img.shields.io/node/v/@miichom/lodestone)

A **minimal, fully typed [Lodestone](https://na.finalfantasyxiv.com/lodestone/) client** for _[Final Fantasy XIV](https://www.finalfantasyxiv.com/)_, providing access to **all endpoints exposed by the Lodestone** through a consistent, schema-driven API.

Designed for **server-side and worker runtimes**: [Node.js 20+](https://nodejs.org/), [Bun](https://bun.sh/), [Cloudflare Workers](https://developers.cloudflare.com/workers/), and [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).

## Why?

Most Lodestone scrapers rely on DOM emulation (e.g. [JSDOM](https://github.com/jsdom/jsdom), [cheerio](https://cheerio.js.org/)), which increases bundle size, slows cold starts, and often breaks in edge or serverless environments.

`@miichom/lodestone` avoids DOM dependencies entirely, using a **predictable, schema-driven parsing model** that works consistently across modern runtimes.

## Features

- 🪶 Lightweight and dependency-minimal
- 🧭 Fully typed [TypeScript](https://www.typescriptlang.org/) API
- ⚡ Edge- and serverless-friendly
- 🧱 No DOM, no JSDOM, no cheerio
- 🌐 Access to all Lodestone endpoints
- 🔍 Search and lookup across supported resources
- 🧩 Optional column-based data fetching

## Install

```bash
npm install @miichom/lodestone
```

## Example usage

```ts
import Lodestone from "@miichom/lodestone";

const ls = new Lodestone();

// fetch a character
const character = await ls.character.get(12345678);

// fetch specific columns
const partial = await ls.character.get(12345678, {
  columns: ["mount"],
});

// search characters
const results = await ls.character.find({
  q: "Y'shtola",
  worldname: "Twintania",
});
```

> Additional Lodestone endpoints follow the same API pattern and are exposed through their respective namespaces.

## Options

The `Lodestone` constructor accepts a small set of configuration options.  
These apply globally to all endpoints (`character`, `cwls`, `freecompany`, `linkshell`, `pvpteam`).

```ts
const ls = new Lodestone({
  locale: "eu",
  headers: {
    "user-agent": "my-xiv-tool/1.0",
  },
});
```

### `locale?: "de" | "eu" | "fr" | "jp" | "na"`

Selects which Lodestone region to target. Defaults to **`"na"`**.

Each locale maps to its own Lodestone instance:

- `na` → https://na.finalfantasyxiv.com/lodestone
- `eu` → https://eu.finalfantasyxiv.com/lodestone
- `jp` → https://jp.finalfantasyxiv.com/lodestone
- `fr` → https://fr.finalfantasyxiv.com/lodestone
- `de` → https://de.finalfantasyxiv.com/lodestone

All requests made through the client automatically use the selected locale.

### `headers?: Record<string, string>`

Optional request headers applied to every Lodestone request.

- Header keys are normalized to lowercase.
- A default User‑Agent is always prepended:

```
curl/0.1.0 (+https://github.com/miichom/lodestone)
```

If you provide your own `user-agent`, it is appended:

```ts
headers: {
  "user-agent": "my-app/1.0",
}
// → curl/0.1.0 (+https://github.com/miichom/lodestone) my-app/1.0
```

For more information on the `User-Agent` header, please see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent.

> While optional, providing a custom User‑Agent is recommended for any automated or high‑volume usage.

### Column options (for `get` only)

Some endpoints (notably **characters**) expose additional “column” pages on Lodestone.  
You can request them via the `columns` option:

```ts
const profile = await ls.character.get(12345678, {
  columns: ["mount", "minion"],
});
```

Columns are fetched lazily and merged into the returned object.

## Attribution

_Final Fantasy XIV_ and all related assets, including data accessed through the [Lodestone](https://na.finalfantasyxiv.com/lodestone/), are the intellectual property of &copy; [SQUARE ENIX CO., LTD.](https://www.square-enix.com/) All rights reserved.

This project is not affiliated with or endorsed by Square Enix.

# Contributing

See [`CONTRIBUTING.md`](.github/CONTRIBUTING.md).

# License

See [`LICENSE.md`](./LICENSE.md).

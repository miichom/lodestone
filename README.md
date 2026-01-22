# @miichom/lodestone

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

## Usage

```ts
import Lodestone from "@miichom/lodestone";

const ls = new Lodestone({ locale: "na" });
```

### Example: characters

```ts
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

## Attribution

_Final Fantasy XIV_ and all related assets, including data accessed through the [Lodestone](https://na.finalfantasyxiv.com/lodestone/), are the intellectual property of &copy; [SQUARE ENIX CO., LTD.](https://www.square-enix.com/) All rights reserved.

This project is not affiliated with or endorsed by Square Enix.

# Contributing

See [`CONTRIBUTING.md`](.github/CONTRIBUTING.md).

# License

See [`LICENSE.md`](./LICENSE.md).

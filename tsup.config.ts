import type { Options } from "tsup";

export const tsup: Options = {
  clean: true,
  dts: true,
  format: ["esm"],
  minify: "terser",
  skipNodeModulesBundle: true,
  entryPoints: ["src/index.ts"],
  target: "es2020",
  outDir: "dist",
  entry: ["src/index.ts"],
  terserOptions: { format: { comments: /(^\*\*)|(@preserve|@license|@cc_on)/ } },
};

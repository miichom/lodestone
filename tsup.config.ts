import type { Options } from "tsup";

export const tsup: Options = {
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  entryPoints: ["src/index.ts"],
  format: ["esm"],
  minify: "terser",
  outDir: "dist",
  skipNodeModulesBundle: true,
  target: "es2020",
  terserOptions: { format: { comments: /(^\*\*)|(@preserve|@license|@cc_on)/ } },
};

import type { Options } from "tsup";

export const tsup: Options = {
  clean: true,
  dts: true,
  format: ["cjs", "esm", "iife"],
  minify: "terser",
  skipNodeModulesBundle: true,
  entryPoints: ["src/index.ts"],
  target: "es2020",
  outDir: "dist",
  entry: ["src/**/*.ts"],
  splitting: true,
};

import { defineConfig } from "tsdown";

export default defineConfig({
  format: ["cjs", "esm"],
  minify: "dce-only",
  sourcemap: true,
});

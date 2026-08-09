import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["cobertura", "json-summary", "lcov"],
    },
    environment: "edge-runtime",
    globals: true,
    testTimeout: 10000, // 10s
  },
});

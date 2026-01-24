import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: { provider: "v8", reporter: ["text", "json-summary", "lcov", "cobertura"] },
    environment: "node",
    globals: true,
    hookTimeout: 10000,
    testTimeout: 10000,
  },
});

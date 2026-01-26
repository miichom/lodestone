import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json-summary", "lcov", "cobertura"],
      thresholds: { branches: 90, functions: 90, lines: 90, statements: 90 },
    },
    environment: "node",
    globals: true,
    hookTimeout: 10_000,
    testTimeout: 10_000,
  },
});

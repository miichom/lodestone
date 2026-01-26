import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json-summary", "lcov", "cobertura"],
      thresholds: { branches: 75, functions: 80, lines: 80, statements: 80 },
    },
    environment: "node",
    globals: true,
    hookTimeout: 10_000,
    testTimeout: 10_000,
  },
});

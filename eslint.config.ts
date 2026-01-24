import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

export default defineConfig([
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  perfectionist.configs["recommended-natural"],
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
]);

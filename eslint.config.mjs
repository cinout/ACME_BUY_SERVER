import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config({
  files: ["**/*.{js,ts}"],
  ignores: ["dist", "node_modules", "build"],
  extends: [pluginJs.configs.recommended, ...tseslint.configs.recommended],
  // env: {
  //   node: true,
  //   es2021: true,
  // },

  languageOptions: {
    ecmaVersion: 2021,
    globals: globals.node,
    parserOptions: {
      sourceType: "module",
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "warn",
  },
  // parser: "@typescript-eslint/parser",
  // plugins: ["@typescript-eslint"],
});

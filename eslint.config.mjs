import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config({
  files: ["**/*.{js,ts}"], // tells ESLint to look at all JavaScript/TypeScript files in our project folder
  ignores: ["dist", "node_modules", "build"], // do not check these files
  extends: [pluginJs.configs.recommended, ...tseslint.configs.recommended],
  languageOptions: {
    ecmaVersion: "latest",
    globals: globals.node, // specifies global variables that are predefined. It tells ESLint to include all global variables defined in the globals.node settings such as the process
    parserOptions: {
      sourceType: "module",
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error",
  },
});

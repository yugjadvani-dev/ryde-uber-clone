import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    extends: "eslint:recommended",
    plugins: ['prettier'],
    rules: {
      "prettier/prettier": "error",
      semi: ["warn", "always"]
    },
    ignorePatterns: ['node_modules/', 'public/'], // Add ignore patterns here
  }
];
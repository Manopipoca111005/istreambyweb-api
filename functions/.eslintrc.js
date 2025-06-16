/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"], // força LF
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-unused-vars": ["warn"],
    "no-console": ["off"],
  },
};

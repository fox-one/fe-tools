/* eslint-disable sort-keys */

require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    require.resolve("eslint-config-standard"),
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended"
  ],
  overrides: [
    {
      files: ["*.js", "*.cjs", "*.mjs"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/restrict-template-expressions": "off"
      }
    }
  ],
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    extraFileExtensions: [".cjs", ".mjs"],
    warnOnUnsupportedTypeScriptVersion: false
  },
  plugins: [
    "@typescript-eslint",
    "header",
    "import",
    "simple-import-sort",
    "sort-destructure-keys"
  ],
  rules: {
    quotes: ["error", "double"],
    indent: "off",
    "on-use-before-define": "off",
    semi: [2, "always"],
    "no-extra-semi": 2,
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/type-annotation-spacing": "error",
    "arrow-parens": ["error", "always"],
    "default-param-last": [0],
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
      {
        blankLine: "any",
        prev: ["const", "let", "var"],
        next: ["const", "let", "var"]
      },
      { blankLine: "always", prev: "*", next: "block-like" },
      { blankLine: "always", prev: "block-like", next: "*" },
      { blankLine: "always", prev: "*", next: "function" },
      { blankLine: "always", prev: "function", next: "*" },
      { blankLine: "always", prev: "*", next: "try" },
      { blankLine: "always", prev: "try", next: "*" },
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: "*", next: "import" },
      { blankLine: "always", prev: "import", next: "*" },
      { blankLine: "any", prev: "import", next: "import" }
    ],
    "sort-destructure-keys/sort-destructure-keys": [2, { caseSensitive: true }],
    "sort-keys": "error"
  },
  settings: {
    "import/extensions": [".js", ".ts", ".tsx"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": require.resolve("eslint-import-resolver-node")
  }
};

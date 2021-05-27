/* eslint-disable sort-keys */

require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    extraFileExtensions: [".cjs", ".mjs", ".vue"],
    warnOnUnsupportedTypeScriptVersion: false
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:vue/recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  overrides: [
    {
      files: ["*.js", "*.cjs", "*.mjs"],
      rules: {
        "@typescript-eslint/no-var-requires": "off"
      }
    },
    {
      files: ["*.vue"],
      rules: {
        "sort-keys": "off"
      }
    }
  ],
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
    semi: [2, "always"],
    "no-extra-semi": 2,
    "on-use-before-define": "off",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/type-annotation-spacing": "error",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-floating-promises": "off",
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

const base = require("@foxone/dev/config/eslint.cjs");

module.exports = {
  ...base,
  ignorePatterns: [
    ".eslintrc.cjs",
    ".github/**",
    ".vscode/**",
    ".yarn/**",
    "**/build/*",
    "**/coverage/*",
    "**/node_modules/*"
  ],
  parserOptions: {
    ...base.parserOptions,
    project: ["./tsconfig.json"]
  }
};

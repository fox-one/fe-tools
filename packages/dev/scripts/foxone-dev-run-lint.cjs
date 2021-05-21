#!/usr/bin/env node

const argv = require("yargs").options({
  "skip-eslint": {
    description: "Skips running eslint",
    type: "boolean"
  },
  "skip-tsc": {
    description: "Skips runnung tsc",
    type: "boolean"
  }
});

const execSync = require("./execSync.cjs");

console.log("$ foxone-dev-run-lint", process.argv.slice(2).join("  "));

if (!argv["skip-eslint"]) {
  const extra = process.env.GITHUB_REPO ? "" : "--fix";

  execSync(
    `yarn foxone-exec-eslint ${extra} --resolve-plugins-relative-to ${__dirname} --ext .js,.cjs,.mjs,.ts,.tsx ${process.cwd()}`
  );
}

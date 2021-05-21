#!/usr/bin/env node
const fs = require("fs");
const fse = require("fse");
const path = require("path");
const rimraf = require("rimraf");

console.log("$ foxone-dev-build-docs", process.argv.slice(2).join("  "));

let docRoot = path.join(process.cwd(), "docs");

if (fs.existsSync(docRoot)) {
  docRoot = path.join(process.cwd(), "build-docs");

  rimraf.sync(docRoot);

  fse.copySync(path.join(process.cwd(), "docs"), docRoot);
}

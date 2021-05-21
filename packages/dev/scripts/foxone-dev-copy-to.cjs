#!/usr/bin/env node

const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const rimraf = require("rimraf");

const copySync = require("./copySync.cjs");
const execSync = require("./execSync.cjs");

const args = process.argv.slice(2);

console.log("$ foxone-dev-copy-to", args.join("  "));

if (args.length !== 1) {
  throw new Error("Expected one <destination> argument");
}

const dest = path.join(process.cwd(), "..", args[0], "node_modules");

if (!fs.existsSync(dest)) {
  throw new Error("Destination node_modules folder does not exist");
}

execSync("yarn build");

fs.readdirSync("packages")
  .map((dir) => {
    const pkgPath = path.join(process.cwd(), "packages", dir);

    return [pkgPath, path.join(pkgPath, "package.json")];
  })
  .filter(([, jsonPath]) => fs.existsSync(jsonPath))
  .map(([pkgPath, json]) => [
    JSON.parse(fs.readFileSync(json, "utf-8")).name,
    pkgPath
  ])
  .forEach(([name, pkgPath]) => {
    console.log(`*** Copying ${name} to ${dest}`);

    const outDest = path.join(dest, name);

    rimraf.sync(outDest);

    mkdirp.sync(outDest);

    copySync(`${pkgPath}/build/**/*`, outDest);

    if (fs.existsSync(`${pkgPath}/node_modules`)) {
      copySync(`${pkgPath}/node_modules/**/*`, `${outDest}/node_modules`);
    }
  });

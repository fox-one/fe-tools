#!/usr/bin/env node

console.log("$ gh-release", process.argv.slice(2).join(" "));

require("gh-release/bin/cli");

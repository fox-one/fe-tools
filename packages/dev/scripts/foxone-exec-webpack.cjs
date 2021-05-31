#!/usr/bin/env node

console.log("$ webpack", process.argv.slice(2).join("  "));

const execSync = require("./execSync.cjs");
const args = process.argv.slice(2).join("  ");

execSync(`yarn webpack ${args}`);

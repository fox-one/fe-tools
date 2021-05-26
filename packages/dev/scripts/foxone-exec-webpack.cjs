#!/usr/bin/env node

const execSync = require("./execSync.cjs");

const args = process.argv.slice(2).join("  ");

execSync(`yarn webpack ${args}`);

#!/usr/bin/env node

console.log("$ foxone-dev-run-test", process.argv.slice(2).join("  "));

process.env.NODE_OPTIONS = `--experimental-vm-modules${
  process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS}` : ""
}`;

require("jest-cli/bin/jest");

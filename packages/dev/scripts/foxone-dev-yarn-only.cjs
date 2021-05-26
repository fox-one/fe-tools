#!/usr/bin/env node

const chalk = require("chalk");

if (process.env.npm_execPath.includes("yarn")) {
  process.exit(0);
}

const blank = "".padStart(75);

console.error(
  chalk.white.bold.bgRed(
    `${blank}\n ${chalk.bold(
      "FATAL: The use of yarn is required, install via npm is not supported"
    )}`
  )
);

console.error(
  `Technical explanation: All the projects in the ${chalk.bold(
    "@foxone"
  )} family use yarn workspace, along with hoisting of dependencies. Currently only yarn supports package.json workspace,  hence the limitation.
    

    If yarn is not available, you can get it from https://yarnpkg.com/
  `
);

process.exit(1);

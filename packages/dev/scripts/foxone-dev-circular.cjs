#!/usr/bin/env node

const chalk = require("chalk");
const madge = require("madge");

console.log("$ foxone-dev-circular", process.argv.slice(2).join("  "));

madge("./", { fileExtensions: ["ts", "tsx"] })
  .then((res) => {
    const circular = res.circular();

    if (circular.length) {
      process.stdout.write(
        chalk.red.bold(`Found ${circular.length} circular dependencies\n`)
      );
    } else {
      process.stdout.write(chalk.bold("No circular dependency found!\n"));
    }

    circular.forEach((path, idx) => {
      process.stdout.write(
        chalk.dim(`${(Number(idx) + 1).toString().padStart(4)}: `)
      );

      path.forEach((module, idx) => {
        if (idx) {
          process.stdout.write(chalk.dim(" > "));
        }

        process.stdout.write(chalk.cyan.bold(module));
      });

      process.stdout.write("\n");
    });

    if (circular.length) {
      throw new Error("failed");
    }
  })
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

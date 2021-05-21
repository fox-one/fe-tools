#!/usr/bin/env node

console.log("$ gh-pages", process.argv.slice(2).join(" "));

require("gh-pages/bin/gh-pages")(process.argv)
  .then(() => {
    process.stdout.write("Published\n");
  })
  .catch((error) => {
    process.stderr.write(`${error.message}\n`, () => process.exit(1));
  });

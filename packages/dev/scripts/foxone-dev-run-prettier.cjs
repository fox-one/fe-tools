const execSync = require("./execSync.cjs");

console.log("$ foxone-dev-run-prettier", process.argv.slice(2).join("  "));

execSync(`yarn foxone-exec-prettier --write ${__dirname}`);

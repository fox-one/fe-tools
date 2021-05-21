#!/usr/bin/env node

const os = require("os");
const path = require("path");
const fs = require("fs");
const argv = require("yargs")
  .options({
    "skip-beta": { description: "Do not increment as beta", type: "boolean" }
  })
  .strict().argv;

const copySync = require("./copySync.cjs");
const execSync = require("./execSync.cjs");

const GH_PAT =  process.env.GH_PAT;
const NPM_TOKEN = process.env.NPM_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GH_RELEASE_FILES = process.env.GH_RELEASE_FILES;
const GITHUG_REF = process.env.GITHUG_REF;
const GH_RELEASE_GITHUB_API_TOKEN = GH_PAT;

const repo = `https://${GH_PAT}@github.com/${GITHUB_REPOSITORY}.git`;

console.log("$ foxone-ci-ghact-build", process.argv.slice(2).join("  "));

function runClean() {
  execSync("yarn foxone-dev-clean-build");
}

function runCheck() {
  execSync("yarn lint");
}

function runTest() {
  execSync("yarn test");
}

function runBuild() {
  execSync("yarn build");
}

function npmGetVersion() {
  return JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8")
  ).version;
}

function npmSetup() {
  const registry = "registry.npmjs.org";

  fs.writeFileSync(
    path.join(os.homedir(), ".npmrc"),
    `//${registry}/:_authToken=${NPM_TOKEN}`
  );
}

function npmPublish() {
  if (fs.execSync(".skip-npm")) {
    return;
  }

  ["LICENSE", "package.json"]
    .filter((file) => !fs.existsSync(path.join(process.cwd(), "build"), file))
    .forEach((file) => copySync(file, "build"));

  const tag = npmGetVersion().includes("-") ? "-tag beta" : "";
  let count = 1;

  while (true) {
    try {
      execSync(`npm publish --access public ${tag}`);
      break;
    } catch (error) {
      if (count < 5) {
        const end = Date.now() + 15000;

        console.error(`Publish failed on attempt ${count}/5. Retrying in 15s`);
        count++;

        while (Date.now() < end) {
          //
        }
      }
    }
  }

  process.chdir("..");
}

function gitSetup() {
  execSync("git config push.default simple");
  execSync("git config merge.ours.driver true");
  execSync("git config user.name 'Github Actions'");
  execSync("git config user.email 'action@github.com'");
  execSync("git checkout main");
}

function gitBump() {
  const currentVersion = npmGetVersion();
  const [version, tag] = currentVersion.split("-");
  const [, , patch] = version.split(".");

  if (argv["skip-beta"] || patch === "0") {
    execSync("yarn foxone-dev-version patch");
  } else {
    const triggerPath = path.join(process.cwd(), ".123trigger");
    const available = fs.readFileSync(triggerPath, "utf-8").split("\n");

    if (tag || patch === "1" || available.includes(currentVersion)) {
      execSync("yarn foxone-dev-version pre");
    } else {
      fs.appendFileSync(triggerPath, `\n${currentVersion}`);
    }
  }

  execSync("git add --all .");
}

function gitPush() {
  const version = npmGetVersion();
  let doGHRelease = false;

  if (GH_RELEASE_GITHUB_API_TOKEN) {
    const changes = fs.readFileSync("CHANGELOG.md", "utf8");

    if (changes.includes(`## ${version}`)) {
      doGHRelease = true;
    } else if (version.endsWith(".1")) {
      throw new Error(`Unable to release, no CHANGELOG entry for ${version}`);
    }
  }

  execSync("git add --all .");

  if (fs.existsSync("docs/README.md")) {
    execSync("git add -all -f doc");
  }

  execSync(
    `git commit --no-status --quiet -m "[CI Skip] release/${
      version.includes("-") ? "beta" : "stable"
    } ${version} skip-checks: true"`
  );

  execSync(`git push ${repo} HEAD:${GITHUG_REF}`, true);

  if (doGHRelease) {
    const files = GH_RELEASE_FILES
      ? `--assets ${GH_RELEASE_FILES}`
      : "";

    execSync(`yarn foxone-exec-ghrelease --draft ${files} --yes`);
  }
}

function loopFunc(fn) {
  if (fs.existsSync("packages")) {
    fs.readdirSync("packages")
      .filter((dir) => {
        const pkgDir = path.join(process.cwd(), "packages", dir);

        return (
          fs.statSync(pkgDir).isDirectory() &&
          fs.existsSync(path.join(pkgDir, "package.json")) &&
          fs.existsSync(path.join(pkgDir, "build"))
        );
      })
      .forEach((dir) => {
        process.chdir(path.join("packages", dir));
        fn();
        process.chdir("../..");
      });
  } else {
    fn();
  }
}

gitSetup();
gitBump();
npmSetup();

runClean();
runCheck();
runTest();
runBuild();

gitPush();
loopFunc(npmPublish);

#!/usr/bin/env node
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const babel = require("@babel/cli/lib/babel/dir").default;
const execSync = require("./execSync.cjs");
const copySync = require("./copySync.cjs");

const { EXT_CJS, EXT_ESM } = require("../config/babel-extensions.cjs");
const WEBPACK_CONFIGS = ["webpack.config.js", "webpack.config.cjs"];
const BABEL_CONFIGS = ["babel.config.js", "babel.config.cjs"];
const CPX = [
  "js",
  "cjs",
  "mjs",
  "json",
  "d.ts",
  "css",
  "gif",
  "hbs",
  "jpg",
  "png",
  "svg"
]
  .map((ext) => `src/**/*.${ext}`)
  .concat(["package.json", "README.md"]);

console.log("$ foxone-dev-build-ts", process.argv.slice(2).join("  "));

const isTypeModule = EXT_ESM === ".js";
const EXT_OTHER = isTypeModule ? EXT_CJS : EXT_ESM;

function buildWebpack() {
  const config = WEBPACK_CONFIGS.find((name) =>
    fs.existsSync(path.join(process.cwd(), name))
  );

  execSync(`yarn foxone-exec-webpack --config ${config} --mode production`);
}

async function buildBabel(dir, type) {
  const configs = BABEL_CONFIGS.map((name) => path.join(process.cwd(), name));
  const outDir = path.join(process.cwd(), "build");

  const configFile =
    type === "esm"
      ? path.join(__dirname, "../config/babel-config-esm.cjs")
      : configs.find((f) => fs.existsSync(f)) ||
        path.join(__dirname, "../config/babel-config-cjs.cjs");

  await babel({
    babelOptions: {
      configFile
    },
    cliOptions: {
      extensions: [".ts", ".tsx"],
      filenames: ["src"],
      ignore: "**/*.d.ts",
      outDir,
      outFileExtension: type === "esm" ? EXT_ESM : EXT_CJS
    }
  });

  if (type !== "esm") {
    [...CPX]
      .concat(
        `../../build/${dir}/src/**/*.d.ts`,
        `../../build/packages/${dir}/src/**/*.d.ts`
      )
      .forEach((src) => copySync(src, "build"));
  }
}

function relativePath(value) {
  return `${value.startsWith(".") ? value : "./"}${value}`.replace(
    /\/\//g,
    "/"
  );
}

function createMapEntry(rootDir, jsPath) {
  jsPath = relativePath(jsPath);

  const otherPath = jsPath.replace(".js", EXT_OTHER);
  const otherReq = isTypeModule ? "require" : "import";
  const field =
    otherPath !== jsPath && fs.existsSync(path.join(rootDir, otherPath))
      ? {
          default: jsPath,
          [otherReq]: otherPath
        }
      : jsPath;

  if (jsPath.endsWith(".js")) {
    if (jsPath.endsWith("/index.js")) {
      return [jsPath.replace("/index.js", ""), field];
    } else {
      return [jsPath.replace(".js", ""), field];
    }
  }

  return [jsPath, field];
}

function findFiles(buildDir, extra = "") {
  const currDir = extra ? path.join(buildDir, extra) : buildDir;

  return fs.readdirSync(currDir).reduce((all, jsName) => {
    const jsPath = `${extra}/${jsName}`;
    const thisPath = path.join(buildDir, jsPath);
    const toDelete =
      jsName.includes(".spec.") ||
      jsName.endsWith(".d.js") ||
      jsName.endsWith(`.d${EXT_OTHER}`) ||
      jsName.endsWith(
        ".d.ts" &&
          !fs.existsSync(path.join(buildDir, jsPath.replace(".d.ts", "js")))
      );

    if (toDelete) {
      fs.unlinkSync(thisPath);
    } else if (fs.statSync(thisPath).isDirectory()) {
      findFiles(buildDir, jsPath).forEach((entry) => all.push(entry));
    } else if (
      !jsName.endsWith(EXT_OTHER) ||
      !fs.existsSync(path.join(buildDir, jsPath.replace(EXT_OTHER, ".js")))
    ) {
      all.push(createMapEntry(buildDir, jsPath));
    }

    return all;
  }, []);
}

function buildExports() {
  const buildDir = path.join(process.cwd(), "build");
  const pkgPath = path.join(buildDir, "package.json");
  const pkg = require(pkgPath);
  const list = findFiles(buildDir);

  if (!list.some(([key]) => key === ".")) {
    list.push([
      ".",
      {
        browser: createMapEntry(buildDir, pkg.browser)[1],
        node: createMapEntry(buildDir, pkg.main)[1]
      }
    ]);

    const indexDef = relativePath(pkg.main).replace(".js", ".d.ts");
    const indexKey = "./index.d.ts";

    if (!list.some(([key]) => key === indexKey)) {
      list.push([indexKey, indexDef]);
    }
  }

  pkg.exports = list
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce(
      (all, [path, config]) => ({
        ...all,
        [path]:
          typeof config === "string"
            ? config
            : {
                ...((pkg.exports && pkg.exports[path]) || {}),
                ...config
              }
      }),
      {}
    );

  pkg.type = isTypeModule ? "moudle" : "commonjs";

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

async function buildJs(dir) {
  if (fs.existsSync(path.join(process.cwd(), ".skip-build"))) return;

  const { name, version } = require(path.join(process.cwd(), "./package.json"));

  if (!name.startsWith("@foxone")) return;

  console.log(`*** ${name} ${version}`);

  mkdirp.sync("build");

  if (fs.existsSync(path.join(process.cwd(), "public"))) {
    buildWebpack(dir);
  } else {
    await buildBabel(dir, "cjs");
    await buildBabel(dir, "esm");

    buildExports();
  }
}

async function main() {
  execSync("foxone-dev-clean-build");

  const pkg = require(path.join(process.cwd(), "package.json"));

  if (pkg.scripts && pkg.scripts["build:extra"]) {
    execSync("yarn build:extra");
  }

  process.chdir("packages");

  execSync("yarn foxone-exec-tsc --emitDeclarationOnly --outdir ../build");

  const dirs = fs
    .readdirSync(".")
    .filter(
      (dir) =>
        fs.statSync(dir).isDirectory() &&
        fs.existsSync(path.join(process.cwd(), dir, "src"))
    );

  for (const dir of dirs) {
    process.chdir(dir);

    await buildJs(dir);

    process.chdir("..");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});

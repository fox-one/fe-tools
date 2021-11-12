const resolver = require("./babel-resolver.cjs");

const CONFIG_CJS = {
  modules: "commonjs",
  targets: {
    browsers: "> 0.25% and last 2 versions and not ie 11 and not OperaMini all",
    node: "12"
  }
};

const CONFIG_ESM = {
  modules: false,
  targets: "> 0.25%, not dead"
};

module.exports = function (isEsm) {
  return resolver([
    "@babel/preset-typescript",
    ["@babel/preset-env", isEsm ? CONFIG_ESM : CONFIG_CJS]
  ]);
};

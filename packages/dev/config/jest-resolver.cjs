const path = require("path");

module.exports = function resolver(file, config) {
  return file.includes("package.json") || file.includes("package-info.json")
    ? path.join(
        config.basedir.replace("/src", "/"),
        file.replace("package-info.json", "package.json")
      )
    : config.defaultResolver(file, config);
};

const packageJson = require("./package.json");

const browserslist = packageJson.browserslist;

module.exports = {
  targets: "defaults",
  presets: [
    [
      "@babel/preset-env",
      {
        targets:
          process.env.NODE_ENV === "production"
            ? browserslist.production
            : browserslist.development,
        modules: false,
        spec: true,
        useBuiltIns: "usage",
        forceAllTransforms: true,
        corejs: {
          version: 3,
          proposals: false,
        },
      },
    ],
  ],
};

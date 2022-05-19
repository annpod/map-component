import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import eslint from "@rollup/plugin-eslint";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import path from "path";

const packageJson = require("./package.json");

export default [
  {
    input: "src/index.tsx",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        exports: "named",
        sourcemap: true,
        plugins: [
          getBabelOutputPlugin({
            configFile: path.resolve(__dirname, "babel.config.js"),
          }),
        ],
      },
      {
        file: packageJson.module,
        format: "esm",
        exports: "named",
        sourcemap: true,
        plugins: [
          getBabelOutputPlugin({
            configFile: path.resolve(__dirname, "babel.config.js"),
          }),
        ],
      },
    ],
    plugins: [
      eslint(),
      resolve({ browser: true }),
      peerDepsExternal({
        includeDependencies: true,
      }),
      typescript({
        useTsconfigDeclarationDir: false,
        rollupCommonJSResolveHack: true,
        clean: true,
        exclude: ["node_modules", "src/**/*.test.(tsx|ts)"],
      }),
    ],
  },
];

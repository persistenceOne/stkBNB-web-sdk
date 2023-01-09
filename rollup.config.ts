import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import camelCase from "lodash.camelcase";
import { RollupOptions } from "rollup";

const pkg = require("./package.json");

const libraryName = "stkbnb-web-sdk";

const config: RollupOptions[] = [
  // browser-friendly UMD build
  {
    input: `src/${libraryName}.ts`,
    output: {
      file: pkg.browser,
      format: "umd",
      name: camelCase(libraryName),
      sourcemap: true
    },
    context: "commonjsGlobal",
    plugins: [
      resolve({ preferBuiltins: true }),   // so Rollup can find `ethers`
      commonjs(),  // so Rollup can convert `ethers` to an ES module
      json(),
      typescript() // so Rollup can convert TypeScript to JavaScript
    ],
    watch: {
      include: "src/**"
    }
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: `src/${libraryName}.ts`,
    output: [
      { file: pkg.main, format: "cjs", sourcemap: true },
      { file: pkg.module, format: "es", sourcemap: true }
    ],
    external: ["ethers"],
    plugins: [
      typescript() // so Rollup can convert TypeScript to JavaScript
    ],
    watch: {
      include: "src/**"
    }
  }
];
export default config;

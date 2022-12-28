import sucrase from "@rollup/plugin-sucrase";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import { readdirSync } from "fs";

export default readdirSync("projects").map((project) => ({
  input: `projects/${project}/index.ts`,
  output: {
    file: `dist/${project}.js`,
    format: "cjs",
    exports: "default",
  },
  plugins: [
    resolve({
      extensions: [".js", ".ts", ".json"],
    }),
    sucrase({
      exclude: ["node_modules/**"],
      transforms: ["typescript"],
    }),
    json(),
    terser(),
  ],
}));

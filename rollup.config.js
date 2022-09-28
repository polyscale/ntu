import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import shebang from "rollup-plugin-preserve-shebang";

const config = [
  {
    input: "src/cli.ts",
    output: {
      file: "dist/cli.cjs",
      format: "cjs",
    },
    plugins: [typescript({ module: "esnext" }), terser(), shebang()],
  },
  {
    input: "src/cli.ts",
    output: {
      file: "dist/cli.mjs",
      format: "esm",
    },
    plugins: [typescript({ module: "esnext" }), terser(), shebang()],
  },
  {
    input: "src/main.ts",
    output: {
      file: "dist/ntu.cjs",
      format: "cjs",
    },
    plugins: [typescript({ module: "esnext" }), terser(), shebang()],
  },
  {
    input: "src/main.ts",
    output: {
      file: "dist/ntu.mjs",
      format: "esm",
    },
    plugins: [typescript({ module: "esnext" }), terser(), shebang()],
  },
];

export default config;

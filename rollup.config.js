import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "esm",
    sourcemap: true
  },
  external: ["react", "react-dom", "lucide-react"],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    postcss({
      modules: true,
      extract: "dist/hyperkit.css" 
    })
  ]
};
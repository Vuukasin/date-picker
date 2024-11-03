import { defineConfig } from "tsup";

export default defineConfig({
  sourcemap: false,
  minify: true,
  dts: true,
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  loader: {
    ".js": "jsx",
  },
});

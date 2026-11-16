// Bundles src/ into dist/app.js and copies the static files from public/.
import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
cpSync("public", "dist", { recursive: true });
await build({ entryPoints: ["src/main.js"], bundle: true, minify: true, format: "esm", target: ["es2020"], outfile: "dist/app.js", logLevel: "info" });

import { build as esbuild } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

await esbuild({
  entryPoints: [path.resolve(__dirname, "src/app.ts")],
  platform: "node",
  bundle: true,
  format: "cjs",
  outfile: path.resolve(distDir, "index.cjs"),
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  minify: true,
  logLevel: "info",
  resolveExtensions: [".ts", ".tsx", ".js", ".jsx"],
});

import { build as esbuild } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// 1. ESM 환경에서 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. 출력 폴더 설정 (없으면 생성)
const distDir = path.resolve(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 3. 외부 라이브러리 설정 (번들링에서 제외할 목록)
const externals = [
  "express",
  "cors",
  "cookie-parser",
  "drizzle-orm",
  "yahoo-finance2",
  "@workspace/db",
  "@workspace/api-zod"
];

// 4. 빌드 실행
await esbuild({
  entryPoints: [path.resolve(__dirname, "src/index.ts")],
  platform: "node",
  bundle: true,
  format: "cjs",
  outfile: path.resolve(distDir, "index.cjs"),
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  minify: true,
  external: externals,
  logLevel: "info",
  resolveExtensions: [".ts", ".tsx", ".js", ".jsx"],
  symlinks: false,
});

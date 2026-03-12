import { build as esbuild } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

// 1. ESM 환경에서 __dirname 설정 (tsx 사용 시 필수)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. 경로 및 설정 변수 정의
const distDir = path.resolve(__dirname, "dist");
const externals = [
  "express", 
  "cors", 
  "cookie-parser", 
  "drizzle-orm", 
  "yahoo-finance2",
  "@workspace/db",
  "@workspace/api-zod"
];

// 3. 빌드 실행
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

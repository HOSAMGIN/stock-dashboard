import { build as esbuild } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// 1. 환경 설정 (파일 경로 계산)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. 결과물이 나올 폴더(dist) 설정
const distDir = path.resolve(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 3. 빌드에서 제외할 라이브러리 목록 (에러가 났던 zod 추가 완료)
const externals = [
  "express",
  "cors",
  "cookie-parser",
  "drizzle-orm",
  "yahoo-finance2",
  "zod", // <--- zod 에러 해결을 위해 추가됨
  "@workspace/db",
  "@workspace/api-zod"
];

// 4. 실제 빌드 실행
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
});

import { build as esbuild } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

// ESM 환경(tsx 실행)에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 기존에 정의되지 않았을 수 있는 변수들 (코드에 따라 확인 필요)
const distDir = path.resolve(__dirname, "dist"); 
const externals = ["express", "cors", "cookie-parser", "drizzle-orm", "yahoo-finance2"]; // 로그 기반 외부 모듈 예시

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

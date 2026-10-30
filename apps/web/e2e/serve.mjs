// e2e 용 정적 서버 — 빌드 결과(out)를 Cloudflare Pages 처럼 냄: /currencies/USD → USD.html · 폴더 → index.html (작업 0101)
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const ROOT = new URL("../out/", import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 4399);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json" };

function resolve(urlPath) {
  const p = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  for (const c of [p, `${p}.html`, join(p, "index.html")]) {
    const f = join(ROOT, c);
    if (f.startsWith(ROOT) && existsSync(f) && statSync(f).isFile()) return f;
  }
  return null;
}

createServer((req, res) => {
  const f = resolve(req.url ?? "/");
  if (!f) {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    createReadStream(join(ROOT, "404.html")).on("error", () => res.end("404")).pipe(res);
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" });
  createReadStream(f).pipe(res);
}).listen(PORT, "127.0.0.1", () => console.log(`e2e 서버 http://127.0.0.1:${PORT}`));

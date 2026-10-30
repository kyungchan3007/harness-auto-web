// 서버 · 브라우저 경계 검사 — 서버 파일이 "use client" 파일에서 컴포넌트가 아닌 값(상수 · 함수)을 가져오면 실패 (작업 0092)
//   그런 값은 서버에서 "부르면 오류" 껍데기가 됨: 0081 빌드 깨짐(outageActive) · 0092 링크 주소가 오류 글자(REPO_URL) — 두 번 나와서 검사로 막음
//   고치는 법: 그 값을 "use client" 가 없는 파일(예: shared/site.ts)로 옮김
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB = resolve(__dirname, "..");
const UI = resolve(__dirname, "../../../../packages/ui/src");

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return d.name === "node_modules" ? [] : files(p);
    return /\.(ts|tsx)$/.test(d.name) && !/\.test\.tsx?$/.test(d.name) ? [p] : [];
  });
}

const isClient = (src: string) => /^\s*(\/\/[^\n]*\n|\s)*["']use client["']/.test(src);

/** 가져오는 경로 → 실제 파일 (@/ · 상대 경로 · @hav/ui/*) · 못 찾으면 null */
function resolveImport(from: string, spec: string): string | null {
  let base: string | null = null;
  if (spec.startsWith("@/")) base = join(WEB, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else if (spec.startsWith("@hav/ui/three/")) base = join(UI, "three", spec.slice("@hav/ui/three/".length));
  else if (spec.startsWith("@hav/ui/")) base = join(UI, "components", spec.slice("@hav/ui/".length));
  if (!base) return null;
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) if (existsSync(base + ext) && /\.tsx?$/.test(base + ext)) return base + ext;
  return null;
}

/** 값으로 가져오는 이름들 (import type · { type X } 는 뺌) */
function valueImports(src: string): { names: string[]; spec: string }[] {
  const out: { names: string[]; spec: string }[] = [];
  for (const m of src.matchAll(/^import\s+(?!type\s)([^;]*?)\s+from\s+["']([^"']+)["']/gm)) {
    const [, clause, spec] = m;
    const names: string[] = [];
    const braces = clause.match(/\{([^}]*)\}/);
    if (braces) for (const part of braces[1].split(",")) {
      const p = part.trim();
      if (p && !p.startsWith("type ")) names.push(p.split(/\s+as\s+/)[0].trim());
    }
    const def = clause.replace(/\{[^}]*\}/, "").replace(/,/g, "").trim();
    if (def && !def.startsWith("*")) names.push("default");
    out.push({ names, spec });
  }
  return out;
}

/** 컴포넌트 이름 모양 — 대문자로 시작하고 소문자가 섞임 (GlobeLazy · Converter) · default 는 컴포넌트로 봄 */
const looksLikeComponent = (n: string) => n === "default" || /^[A-Z](?=.*[a-z])[A-Za-z0-9]*$/.test(n);

describe("서버 파일은 'use client' 파일에서 컴포넌트만 가져온다 (작업 0092)", () => {
  const bad: string[] = [];
  for (const f of files(WEB)) {
    const src = readFileSync(f, "utf8");
    if (isClient(src)) continue;
    for (const { names, spec } of valueImports(src)) {
      const target = resolveImport(f, spec);
      if (!target || !isClient(readFileSync(target, "utf8"))) continue;
      for (const n of names) if (!looksLikeComponent(n)) bad.push(`${relative(WEB, f)} ← ${n} (${spec})`);
    }
  }
  it("어긋난 가져오기 없음", () => {
    expect(bad).toEqual([]);
  });
});

describe("검사 도구 자체", () => {
  it("값 가져오기만 셈 (type 은 뺌)", () => {
    expect(valueImports('import { a, type B, C as D } from "./x";\nimport type { E } from "./y";\nimport F from "./z";')).toEqual([
      { names: ["a", "C"], spec: "./x" },
      { names: ["default"], spec: "./z" },
    ]);
  });
  it("컴포넌트 이름 모양", () => {
    expect(looksLikeComponent("GlobeLazy")).toBe(true);
    expect(looksLikeComponent("REPO_URL")).toBe(false);
    expect(looksLikeComponent("outageActive")).toBe(false);
  });
  it("'use client' 알아보기 (맨 위 주석 뒤여도)", () => {
    expect(isClient('"use client";\nexport const A = 1;')).toBe(true);
    expect(isClient('// 설명\n"use client";')).toBe(true);
    expect(isClient('import x from "y";\n"use client";')).toBe(false);
  });
});

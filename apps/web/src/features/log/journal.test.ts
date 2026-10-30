import { describe, expect, it } from "vitest";
import { entryOf, newestFirst, parseRequest, redact, sectionBullets } from "./journal";

const REQUEST = `# 요청 원문

<!-- 사용자·이슈의 요청을 그대로 붙여 넣는다. 요약·정리하지 않는다. -->

## 2026-10-30 사용자 (채팅)
그 지구본 있잖아 실제 지구로 해줄순 없어?
`;

const PLAN = `# 계획

## 무엇을 · 왜
- 지구본을 **실제 지구**로 — NASA
  - 원본 5400×2700
- 잘림 고침

## 허점
<!-- 이번 작업에서 드러난 실수 -->
- 같은 재질에 사진만 넣으면 \`회색\`
- 없음
`;

describe("작업 일지 (LOG-02 · 작업 0090)", () => {
  it("요청 원문은 머리말 · 주석만 빼고 그대로", () => {
    expect(parseRequest(REQUEST)).toBe("## 2026-10-30 사용자 (채팅)\n그 지구본 있잖아 실제 지구로 해줄순 없어?");
  });
  it("목록 줄 — 하위 줄은 앞 줄에 붙이고 '없음' 은 뺌", () => {
    expect(sectionBullets(PLAN, /무엇을/)).toEqual(["지구본을 **실제 지구**로 — NASA · 원본 5400×2700", "잘림 고침"]);
    expect(sectionBullets(PLAN, /허점/)).toEqual(["같은 재질에 사진만 넣으면 `회색`"]);
    expect(sectionBullets(PLAN, /없는 제목/)).toEqual([]);
  });
  it("폴더 하나 → 항목 (굵게 · 코드 표시는 뺌)", () => {
    const e = entryOf("0085-real-globe", { request: REQUEST, plan: PLAN })!;
    expect(e.task).toBe("0085");
    expect(e.slug).toBe("real-globe");
    expect(e.what).toBe("지구본을 실제 지구로 — NASA · 원본 5400×2700");
    expect(e.gaps).toEqual(["같은 재질에 사진만 넣으면 회색"]);
  });
  it("요청 원문이 없거나 폴더 이름이 틀리면 뺌", () => {
    expect(entryOf("0085-real-globe", { plan: PLAN })).toBeNull();
    expect(entryOf("_template", { request: REQUEST })).toBeNull();
    expect(entryOf("0001-x", { request: "# 요청 원문\n<!-- 주석 -->\n" })).toBeNull();
  });
  it("비밀값 · 이메일은 가림 (LOG-04)", () => {
    expect(redact("메일 someone@example.com 로")).toBe("메일 (이메일 가림) 로");
    expect(redact("토큰 ghp_abcdefghijklmnopqrstuvwxyz0123 끝")).toBe("토큰 (비밀값 가림) 끝");
    expect(redact("키 sk-ant-api03-abcdefghijklmnopqrstuv")).toBe("키 (비밀값 가림)");
    expect(redact("a83a4cf51f88f7b33e2e8a258f081900aa11bb22cc")).toBe("(비밀값 가림)");
    // 평범한 글 · 주소 · 짧은 해시는 그대로
    expect(redact("https://tripfx.pages.dev/currencies/USD · 커밋 e4dd061")).toBe("https://tripfx.pages.dev/currencies/USD · 커밋 e4dd061");
  });
  it("최근 작업부터", () => {
    const a = { task: "0009", slug: "a", request: "x", what: null, gaps: [] };
    const b = { ...a, task: "0090" };
    expect([a, b].sort(newestFirst).map((e) => e.task)).toEqual(["0090", "0009"]);
  });
});

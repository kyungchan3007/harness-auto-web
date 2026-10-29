import { TasksSummary } from "@hav/shared/tasks";
import { describe, expect, it } from "vitest";
import { summarize } from "./routes";
import { splitTitle, toRows, toSql } from "./sync";

const U = "https://github.com/kyungchan3007/harness-auto-web";
// 실제 이슈 목록 모양 (2026-10-28 gh api 결과 일부)
const ITEMS = [
  { number: 52, title: "[0052] 지난 작업 목록", html_url: `${U}/issues/52`, author_association: "OWNER" },
  { number: 51, title: "[0050] 만드는 중 페이지", html_url: `${U}/pull/51`, author_association: "OWNER", pull_request: { merged_at: "2026-10-28T14:30:30Z" } },
  { number: 49, title: "열기만 한 PR", html_url: `${U}/pull/49`, author_association: "OWNER", pull_request: { merged_at: null } },
  { number: 60, title: "[0099] 남이 연 이슈", html_url: `${U}/issues/60`, author_association: "NONE" },
  { number: 61, title: "주소가 이상함", html_url: "https://evil.example/x", author_association: "OWNER" },
];

describe("GitHub 목록 → 행", () => {
  it("주인이 연 이슈 · 머지된 PR 만 · 남이 연 이슈 · 안 머지된 PR · 이상한 주소는 버림", () => {
    expect(toRows(ITEMS).map((r) => [r.number, r.kind, r.task])).toEqual([
      [52, "issue", "0052"],
      [51, "pr", "0050"],
    ]);
  });

  it("제목의 줄바꿈 · 제어 문자는 공백 · 너무 길면 자름", () => {
    expect(splitTitle("[0001]  a\nb\u0007c ")).toEqual({ task: "0001", name: "a b c" });
    expect(splitTitle("x".repeat(500)).name).toHaveLength(120);
    // 작업 0057 부터 쓴 제목 모양 (작업 0066)
    expect(splitTitle("작업 0066: 책상 고양이가 테스트에 멈추던 것 고침")).toEqual({ task: "0066", name: "책상 고양이가 테스트에 멈추던 것 고침" });
    expect(splitTitle("작업 0058 · 통화 둘러보기")).toEqual({ task: "0058", name: "통화 둘러보기" });
    expect(splitTitle("작업 노트 정리")).toEqual({ task: null, name: "작업 노트 정리" });
  });
});

describe("SQL", () => {
  it("작은따옴표는 두 번 · 표를 통째로 바꿈", () => {
    const sql = toSql(toRows([{ number: 7, title: "[0007] it's'); DROP TABLE x; --", html_url: `${U}/issues/7`, author_association: "OWNER" }]), "2026-10-28T15:00:00.000Z");
    expect(sql.split("\n")[0]).toBe("DELETE FROM github_items;");
    expect(sql).toContain("'it''s''); DROP TABLE x; --'");
    expect(sql).toContain("7, 'issue', '0007'");
  });
});

describe("GET /tasks 응답", () => {
  it("이름은 이슈에서 · 지난 작업은 머지 최근부터 · 마지막 받은 때", () => {
    const at = "2026-10-28T15:00:00.000Z";
    const rows = [
      { number: 47, kind: "pr" as const, task: "0046", name: "기록 API", url: `${U}/pull/47`, mergedAt: "2026-10-28T13:29:09.000Z", syncedAt: at },
      { number: 51, kind: "pr" as const, task: "0050", name: "만드는 중", url: `${U}/pull/51`, mergedAt: "2026-10-28T14:30:30.000Z", syncedAt: at },
      { number: 50, kind: "issue" as const, task: "0050", name: "만드는 중 페이지", url: `${U}/issues/50`, mergedAt: null, syncedAt: at },
    ];
    const s = TasksSummary.parse(summarize(rows));
    expect(s.names).toEqual({ "0050": "만드는 중 페이지" });
    expect(s.done.map((d) => d.number)).toEqual([51, 47]);
    expect(s.syncedAt).toBe(at);
  });

  it("아직 한 번도 안 받았으면 빈 목록 · syncedAt null", () => {
    expect(summarize([])).toEqual({ names: {}, done: [], syncedAt: null });
  });
});

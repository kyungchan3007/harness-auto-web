import type { ActivityEvent } from "@hav/shared/activity";
import { describe, expect, it } from "vitest";
import { pickTasks } from "./use-tasks";
import { MOOD_TEXT, moodOf } from "./mood";
import { STAGES, deskState } from "./stage";
import { MOODS } from "@hav/ui/three/worker-cat";
import { KEEP_LINES, agoText, clockText, liveStatus, mergeEvents, todayStats } from "./status";

const ev = (id: number, at: string, over: Partial<ActivityEvent> = {}): ActivityEvent => ({ id, at, kind: "edit", label: "코드 수정", file: null, ok: null, task: null, ...over });
const NOW = Date.parse("2026-10-28T14:00:00Z"); // 한국 23:00

describe("상태", () => {
  it("기록이 없으면 none (지어내지 않음)", () => {
    expect(liveStatus([], NOW)).toEqual({ state: "none" });
  });

  it("마지막 기록이 10분 안이면 작업 중 · 넘으면 쉬는 중 + 몇 분 전", () => {
    expect(liveStatus([ev(2, "2026-10-28T13:55:00Z")], NOW)).toMatchObject({ state: "working", ago: "5분 전" });
    expect(liveStatus([ev(2, "2026-10-28T11:00:00Z")], NOW)).toMatchObject({ state: "idle", ago: "3시간 전" });
  });

  it("작업 번호는 마지막 기록 · 없으면 그 전 기록에서 · 게이트는 가장 최근 것", () => {
    const s = liveStatus([ev(3, "2026-10-28T13:59:00Z"), ev(2, "2026-10-28T13:58:00Z", { kind: "gate", ok: false, task: "0050" }), ev(1, "2026-10-28T13:50:00Z", { kind: "gate", ok: true })], NOW);
    expect(s).toMatchObject({ task: "0050", gate: { ok: false } });
  });

  it("시각은 한국 시각 HH:MM:SS", () => {
    expect(clockText("2026-10-28T14:18:44.120Z")).toBe("23:18:44");
    expect(clockText("2026-10-28T15:05:00Z")).toBe("00:05:00");
  });

  it("몇 분 전 글", () => {
    expect([agoText(30_000), agoText(59 * 60_000), agoText(25 * 3_600_000)]).toEqual(["방금", "59분 전", "1일 전"]);
  });
});

describe("기록 합치기", () => {
  it("id 로 중복 없이 · 최신부터 · 최대 줄 수", () => {
    const a = [ev(2, "2026-10-28T13:00:00Z"), ev(1, "2026-10-28T12:00:00Z")];
    expect(mergeEvents(a, [ev(3, "2026-10-28T13:10:00Z"), ev(2, "2026-10-28T13:00:00Z")]).map((e) => e.id)).toEqual([3, 2, 1]);
    const many = Array.from({ length: KEEP_LINES + 5 }, (_, i) => ev(i + 1, "2026-10-28T13:00:00Z"));
    expect(mergeEvents([], many)).toHaveLength(KEEP_LINES);
  });
});

describe("오늘 숫자 (한국 날짜)", () => {
  it("한국 자정 기준으로 셈 — UTC 15:00 전날은 오늘이 아님", () => {
    const s = todayStats(
      [ev(4, "2026-10-28T13:00:00Z", { kind: "blocked" }), ev(3, "2026-10-27T15:30:00Z", { kind: "gate", ok: true }), ev(2, "2026-10-27T14:59:00Z", { kind: "blocked" })],
      NOW,
    );
    expect(s).toEqual({ lines: 2, blocked: 1, gatePassed: 1 });
  });
});

describe("지난 작업 고르기", () => {
  const sum = (n: number, syncedAt: string | null) => ({ names: {}, done: Array.from({ length: n }, (_, i) => ({ number: i + 1, task: null, name: "x", url: "u", mergedAt: "2026-10-28T00:00:00.000Z" })), syncedAt });

  it("브라우저에서 새로 받은 게 있으면 그것 · 실패면 빌드 때 것", () => {
    const build = { ok: true as const, data: sum(1, "2026-10-28T10:00:00.000Z") };
    expect(pickTasks(build, { ok: true, data: sum(3, "2026-10-28T11:00:00.000Z") })).toMatchObject({ ok: true, data: { done: { length: 3 } } });
    expect(pickTasks(build, { ok: false, reason: "연결 실패" })).toBe(build);
    expect(pickTasks(build, null)).toBe(build);
  });

  it("둘 다 실패면 빌드 때 이유", () => {
    expect(pickTasks({ ok: false, reason: "HTTP 503" }, { ok: false, reason: "연결 실패" })).toEqual({ ok: false, reason: "HTTP 503" });
  });
});

describe("🐱 표정 고르기", () => {
  const at = "2026-10-28T13:59:00Z"; // NOW 1분 전 → 작업 중
  const mood = (over: Partial<ActivityEvent>) => moodOf(liveStatus([ev(1, at, over)], NOW));

  it("하는 일에 따라: 수정=키보드 · 읽기/찾기=돋보기 · 브라우저=화면 · 막힘=화들짝", () => {
    expect([mood({ kind: "edit" }), mood({ kind: "read" }), mood({ kind: "search" }), mood({ kind: "browser" }), mood({ kind: "blocked", ok: false })]).toEqual([
      "typing",
      "looking",
      "looking",
      "browsing",
      "startled",
    ]);
  });

  it("게이트 · 테스트는 결과에 따라: 통과=폴짝 · 실패=시무룩 · 모름=톱니", () => {
    expect([mood({ kind: "gate", ok: true }), mood({ kind: "gate", ok: false }), mood({ kind: "gate", ok: null })]).toEqual(["happy", "sad", "working"]);
    expect([mood({ kind: "test", ok: false }), mood({ kind: "test", ok: null }), mood({ kind: "build" })]).toEqual(["sad", "working", "working"]);
  });

  it("10분 넘게 조용하면 꾸벅 · 기록이 없으면 기다림", () => {
    expect(moodOf(liveStatus([ev(1, "2026-10-28T12:00:00Z", { kind: "edit" })], NOW))).toBe("sleeping");
    expect(moodOf(liveStatus([], NOW))).toBe("neutral");
  });

  it("모든 표정에 화면 읽기용 글이 있음", () => {
    for (const m of MOODS) expect(MOOD_TEXT[m].length).toBeGreaterThan(0);
  });
});

describe("작업 책상 단계", () => {
  const t = (id: number, over: Partial<ActivityEvent>) => ev(id, "2026-10-28T13:00:00Z", { task: "0056", ...over });
  const done = (task: string) => [{ number: 57, task, name: "x", url: "u", mergedAt: "2026-10-28T14:00:00.000Z" }];

  it("기록이 없으면 작업 없음 · 1번 책상", () => {
    expect(deskState([], [])).toEqual({ task: null, stage: 0, finished: false });
  });

  it("이슈 · 계획 파일만 고쳤으면 1 이슈 적기 (이슈 만들기의 GitHub 확인은 배포가 아님)", () => {
    expect(deskState([t(2, { kind: "edit", file: "plan.md" }), t(1, { kind: "pr", label: "GitHub 확인" })], []).stage).toBe(0);
  });

  it("코드를 고치면 2 · 테스트 · 게이트 · 커밋이면 3 · PR 만듦 · 머지 · 올림이면 4", () => {
    expect(deskState([t(1, { kind: "edit", file: "stage.ts" })], []).stage).toBe(1);
    expect(deskState([t(2, { kind: "gate", ok: true }), t(1, { kind: "edit", file: "stage.ts" })], []).stage).toBe(2);
    expect(deskState([t(3, { kind: "pr", label: "PR 만듦" })], []).stage).toBe(3);
  });

  it("단계는 뒤로 가지 않음 — 테스트 뒤에 다시 고쳐도 3", () => {
    expect(deskState([t(3, { kind: "edit", file: "stage.ts" }), t(2, { kind: "test", ok: false })], []).stage).toBe(2);
  });

  it("그 작업 PR 이 머지됐으면 끝 · 다른 작업 기록은 섞지 않음", () => {
    expect(deskState([t(1, { kind: "edit", file: "a.ts" })], done("0056"))).toEqual({ task: "0056", stage: 3, finished: true });
    expect(deskState([t(2, { kind: "edit", file: "a.ts" }), ev(1, "2026-10-28T12:00:00Z", { task: "0054", kind: "pr", label: "PR 머지" })], []).stage).toBe(1);
  });

  it("단계마다 이름 · 아이콘", () => {
    expect(STAGES.map((s) => s.name)).toEqual(["이슈 적기", "작업하기", "테스트", "배포"]);
  });
});

describe("작업 책상 — 머지 기록에 작업 번호가 빠져도 (작업 0066)", () => {
  const at = (m: number) => `2026-10-29T07:${String(m).padStart(2, "0")}:00Z`;
  // 실제로 본 순서 (최신부터): 머지는 main 에서 기록돼 작업 번호 없음
  const real = [
    ev(5, at(36), { kind: "read", label: "파일 읽기", task: null }),
    ev(4, at(33), { kind: "pr", label: "PR 머지", task: null }),
    ev(3, at(32), { kind: "gate", label: "게이트 검사", task: "0065" }),
    ev(2, at(31), { kind: "build", label: "빌드", task: "0065" }),
    ev(1, at(20), { kind: "edit", label: "코드 수정", file: "a.tsx", task: "0065" }),
  ];

  it("바로 앞 작업의 머지로 셈 → 4 배포", () => {
    expect(deskState(real, [])).toEqual({ task: "0065", stage: 3, finished: false });
  });

  it("머지 목록에 들어오면 끝", () => {
    expect(deskState(real, [{ number: 66, task: "0065", name: "x", url: "u", mergedAt: at(34) }])).toMatchObject({ finished: true });
  });

  it("배포 쪽이 아닌 작업 번호 없는 기록 · GitHub 확인은 붙이지 않음", () => {
    const e = [ev(2, at(10), { kind: "pr", label: "GitHub 확인", task: null }), ev(1, at(9), { kind: "test", label: "테스트 실행", task: "0065" })];
    expect(deskState(e, [])).toEqual({ task: "0065", stage: 2, finished: false });
  });
});


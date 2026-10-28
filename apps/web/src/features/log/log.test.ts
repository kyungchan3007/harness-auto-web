import type { ActivityEvent } from "@hav/shared/activity";
import { describe, expect, it } from "vitest";
import { pickTasks } from "./use-tasks";
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

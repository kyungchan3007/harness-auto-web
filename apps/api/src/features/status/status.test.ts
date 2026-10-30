import { SiteStatus } from "@hav/shared/status";
import { describe, expect, it } from "vitest";
import { CRON } from "../../index";
import { type RunRow, reasonOf, scheduleOf, siteStatus } from "./status";

const SLOTS = [
  { cron: "0 3 * * 1-5", kind: "collect" as const },
  { cron: "30 4 * * 1-5", kind: "retry" as const },
  { cron: "0 6 * * 1-5", kind: "retry" as const },
];
const run = (startedAt: string, status: RunRow["status"] = "ok", message: string | null = null, source = "koreaexim"): RunRow => ({ startedAt, source, status, rows: status === "ok" ? 22 : 0, message });

describe("사이트 상태 (작업 0105)", () => {
  it("회차 목록이 예약(CRON)과 같음 — 한쪽만 바꾸면 점검판이 엉뚱한 시각을 봄", () => {
    expect(SLOTS.map((s) => s.cron)).toEqual([CRON.fxDaily, CRON.fxRetry1, CRON.fxRetry2]);
  });

  it("이유는 분류만 — 원본 글은 버림", () => {
    expect(reasonOf("koreaexim no-key: KOREAEXIM_KEY 가 설정되지 않음")).toBe("no-key");
    expect(reasonOf("koreaexim http-500: HTTP 500 / frankfurter shape: …")).toBe("http-500");
    expect(reasonOf("뭔가 이상한 글")).toBeNull();
    expect(reasonOf(null)).toBeNull();
  });

  it("2026-10-30 실제: 12:00 · 13:30 안 돎 → missed · 15:00 은 아직", () => {
    const s = scheduleOf(SLOTS, [run("2026-10-29T03:00:30Z")], new Date("2026-10-30T05:40:00Z"), null);
    expect(s).toEqual([
      { time: "12:00", kind: "collect", state: "missed" },
      { time: "13:30", kind: "retry", state: "missed" },
      { time: "15:00", kind: "retry", state: "upcoming" },
    ]);
  });

  it("보통 날: 12:00 수집 → 다시 하는 회차는 not-needed", () => {
    const s = scheduleOf(SLOTS, [run("2026-10-29T03:00:30Z")], new Date("2026-10-29T07:00:00Z"), "2026-10-29T03:00:33Z");
    expect(s.map((x) => x.state)).toEqual(["done", "not-needed", "not-needed"]);
  });

  it("12:00 실패 → 13:30 다시 수집 성공", () => {
    const runs = [run("2026-10-29T04:30:10Z"), run("2026-10-29T03:00:20Z", "error", "koreaexim http-500: HTTP 500")];
    const s = scheduleOf(SLOTS, runs, new Date("2026-10-29T05:00:00Z"), "2026-10-29T04:30:12Z");
    expect(s.map((x) => x.state)).toEqual(["error", "done", "not-needed"]); // 오늘 값이 이미 있으면 남은 다시 하는 회차도 필요 없음
  });

  it("주말은 회차 없음", () => {
    expect(scheduleOf(SLOTS, [], new Date("2026-10-31T05:00:00Z"), null)).toEqual([]);
  });

  it("전체 응답 — 오늘 수집만 · 물가 수집은 뺌 · 계약 모양", () => {
    const runs = [run("2026-10-30T06:00:10Z"), run("2026-10-30T04:00:00Z", "ok", null, "worldbank"), run("2026-10-29T03:00:30Z")];
    const s = siteStatus({ now: new Date("2026-10-30T06:10:00Z"), latestDate: "2026-10-30", runs, slots: SLOTS, firstRateAt: "2026-10-30T06:00:12Z" });
    expect(SiteStatus.parse(s)).toBeTruthy();
    expect(s.today).toBe("2026-10-30");
    expect(s.todayRuns).toHaveLength(1);
    expect(s.lastRun?.at).toBe("2026-10-30T06:00:10Z");
    expect(s.schedule.map((x) => x.state)).toEqual(["missed", "missed", "done"]);
  });
});

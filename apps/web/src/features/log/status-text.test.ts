import type { SiteStatus } from "@hav/shared/status";
import { describe, expect, it } from "vitest";
import { headlineOf, lastRunText, reasonText, runText } from "./status-text";

const base: SiteStatus = { today: "2026-10-30", now: "2026-10-30T05:40:00Z", latestDate: "2026-10-29", lastRun: null, todayRuns: [], schedule: [] };
const slots = (...states: SiteStatus["schedule"][number]["state"][]) => states.map((state, i) => ({ time: ["12:00", "13:30", "15:00"][i], kind: i ? ("retry" as const) : ("collect" as const), state }));

describe("점검판 글 (작업 0105)", () => {
  it("맨 위 한 줄", () => {
    expect(headlineOf({ ...base, latestDate: "2026-10-30" }).tone).toBe("ok");
    expect(headlineOf({ ...base, schedule: slots("missed", "missed", "upcoming") })).toEqual({ tone: "bad", text: "오늘 환율이 아직 없습니다 · 지금은 10월 29일 값" });
    expect(headlineOf({ ...base, schedule: slots("upcoming", "upcoming", "upcoming") }).text).toContain("12시");
    expect(headlineOf({ ...base, today: "2026-10-31", latestDate: "2026-10-30" }).tone).toBe("rest");
    expect(headlineOf({ ...base, schedule: slots("empty", "not-needed", "not-needed") }).text).toContain("공휴일");
  });
  it("이유 — 분류 코드만 한국어로", () => {
    expect(reasonText("no-key")).toBe("인증키 없음");
    expect(reasonText("http-503")).toBe("서버 응답 503");
    expect(reasonText(null)).toBeNull();
  });
  it("수집 한 줄 (한국 시각)", () => {
    expect(runText({ at: "2026-10-29T03:00:30Z", source: "koreaexim", status: "ok", rows: 22, reason: null })).toBe("12:00 · 수출입은행 · 22개 통화");
    expect(runText({ at: "2026-10-30T06:00:10Z", source: "koreaexim", status: "error", rows: 0, reason: "http-500" })).toBe("15:00 · 실패 (서버 응답 500)");
    expect(lastRunText({ ...base, lastRun: { at: "2026-10-29T03:00:30Z", source: "koreaexim", status: "ok", rows: 22, reason: null } })).toBe("10월 29일 12:00 · 수출입은행 · 22개 통화");
  });
});

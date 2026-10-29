import { describe, expect, it } from "vitest";
import { IsoDate } from "./date";
import { CurrencyCode, FxHistoryQuery, FxLatest } from "./fx";
import { LevelsQuery } from "./prices";
import { CurrencySignal } from "./signal";
import { blockMarks, snagText } from "./tasks";

describe("요청 검사", () => {
  it("통화 코드: 소문자도 받아 대문자로 · 3글자가 아니면 실패", () => {
    expect(CurrencyCode.parse("usd")).toBe("USD");
    expect(CurrencyCode.safeParse("US").success).toBe(false);
    expect(CurrencyCode.safeParse("US1").success).toBe(false);
  });

  it("날짜: 달력에 없는 날은 실패", () => {
    expect(IsoDate.safeParse("2026-10-28").success).toBe(true);
    expect(IsoDate.safeParse("2026-02-30").success).toBe(false);
  });

  it("days: 기본 365 · 1~1000 · 글자 숫자도 받음", () => {
    expect(FxHistoryQuery.parse({})).toEqual({ days: 365 });
    expect(FxHistoryQuery.parse({ days: "30" })).toEqual({ days: 30 });
    expect(FxHistoryQuery.safeParse({ days: "0" }).success).toBe(false);
  });

  it("물가 기준 나라: 기본 KOR · 소문자도 대문자로", () => {
    expect(LevelsQuery.parse({})).toEqual({ base: "KOR" });
    expect(LevelsQuery.parse({ base: "jpn" })).toEqual({ base: "JPN" });
  });
});

describe("응답 검사 (화면이 쓰는 쪽)", () => {
  // 배포한 API 실제 응답 모양 (2026-10-28)
  it("최신 환율 · 아직 수집 전이면 null · []", () => {
    expect(FxLatest.parse({ date: null, rates: [] })).toEqual({ date: null, rates: [] });
    const r = FxLatest.parse({
      date: "2026-10-28",
      rates: [{ date: "2026-10-28", currency: "JPY", unit: 100, baseRate: 838.3, ttb: 830, tts: 846.6, source: "koreaexim", fetchedAt: "2026-10-28T12:30:01.000Z" }],
    });
    expect(r.rates[0].unit).toBe(100);
  });

  it("모르는 출처 · 음수 환율은 실패 (지어낸 값이 화면에 안 나가게)", () => {
    const bad = (patch: object) =>
      FxLatest.safeParse({ date: "2026-10-28", rates: [{ date: "2026-10-28", currency: "USD", unit: 1, baseRate: 1324.3, ttb: null, tts: null, source: "koreaexim", fetchedAt: "2026-10-28T12:30:01.000Z", ...patch }] }).success;
    expect(bad({})).toBe(true);
    expect(bad({ source: "guess" })).toBe(false);
    expect(bad({ baseRate: -1 })).toBe(false);
  });

  it("신호: 계산 방법(method)이 없으면 실패 (SIG-02)", () => {
    const ok = {
      currency: "USD", signal: "cheap", reason: "ok", percentile: 0.02,
      latest: { date: "2026-10-28", value: 1324.3 },
      window: { from: "2026-07-31", to: "2026-10-28", count: 59, expected: 64 },
      range: { min: 1322.6, max: 1441.1 },
      method: "최근 90일 중 오늘보다 낮았던 날의 비율 · 예측 아님",
      rule: { windowDays: 90, cheapAt: 0.3, expensiveAt: 0.7, minCoverage: 0.8 },
    };
    expect(CurrencySignal.safeParse(ok).success).toBe(true);
    const { method: _, ...noMethod } = ok;
    expect(CurrencySignal.safeParse(noMethod).success).toBe(false);
  });
});

describe("블록 탑 막힘 표시 (작업 0075)", () => {
  const done = [
    { task: "0070", mergedAt: "2026-10-29T11:00:00.000Z" },
    { task: "0069", mergedAt: "2026-10-29T10:44:00.000Z" },
    { task: null, mergedAt: "2026-10-28T09:00:00.000Z" },
    { task: "0069", mergedAt: "2026-10-29T10:00:00.000Z" },
  ];
  const snags = { "0069": { blocked: 2, failed: 0 } };

  it("아래(오래된 머지)부터 · 막힘이 있었던 작업의 PR 은 모두 · 작업 번호 없으면 false", () => {
    expect(blockMarks(done, snags)).toEqual([false, true, true, false]);
    expect(blockMarks(done, {})).toEqual([false, false, false, false]);
  });

  it("설명 글 — 빨간 블록 수 · 센 날짜 (서울 시간)", () => {
    expect(snagText(blockMarks(done, snags), "2026-10-28T14:55:22.828Z")).toBe("빨간 블록 2개 = 하네스가 막았거나 게이트가 실패했던 작업 · 10월 28일 기록부터 셈");
    expect(snagText([false], "2026-10-28T15:30:00.000Z")).toBe("빨간 블록 없음 — 하네스가 막거나 게이트가 실패한 작업이 없음 · 10월 29일 기록부터 셈");
    expect(snagText([], null)).toContain("아직 센 기록 없음");
  });
});

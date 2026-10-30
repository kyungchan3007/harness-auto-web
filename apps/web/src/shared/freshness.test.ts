import { describe, expect, it } from "vitest";
import { freshness } from "./freshness";

// 한국 시각 = UTC + 9
const at = (kst: string) => new Date(`${kst}+09:00`);

describe("환율이 오늘 값인지 (작업 0095)", () => {
  it("기준일이 오늘이면 아무 말 없음", () => {
    expect(freshness("2026-10-30", at("2026-10-30T15:00:00"))).toEqual({ kind: "today" });
  });
  it("평일 오전 — 아직 고시 전", () => {
    const f = freshness("2026-10-29", at("2026-10-30T09:30:00"));
    expect(f.kind).toBe("before-release");
  });
  it("평일 13시 넘어서도 어제 값 — 늦음 (2026-10-30 실제로 있었던 일)", () => {
    const f = freshness("2026-10-29", at("2026-10-30T13:05:00"));
    expect(f).toEqual({ kind: "late", text: "오늘(10월 30일) 값 반영이 늦어지고 있습니다 · 지금은 10월 29일 값입니다 (공휴일이면 고시가 없습니다)" });
  });
  it("주말 — 금요일 값", () => {
    expect(freshness("2026-10-30", at("2026-10-31T14:00:00")).kind).toBe("no-release");
    expect(freshness("2026-10-30", at("2026-11-01T23:59:00")).kind).toBe("no-release");
  });
  it("한국 날짜로 판단 (UTC 로는 아직 전날)", () => {
    // 2026-10-30 08:00 KST = 2026-10-29 23:00 UTC
    expect(freshness("2026-10-29", at("2026-10-30T08:00:00")).kind).toBe("before-release");
  });
});

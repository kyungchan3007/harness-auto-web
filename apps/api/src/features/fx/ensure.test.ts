import { describe, expect, it } from "vitest";
import type { RateStore } from "./collect";
import { ensureToday } from "./ensure";

function deps(opts: { has?: boolean; lastRunAt?: string | null } = {}) {
  let collected = 0;
  const store: RateStore = { startRun: async () => 1, finishRun: async () => undefined, saveRates: async (r) => ((collected += r.length), r.length) };
  const fetcher: typeof fetch = async (u) => new Response(String(u).includes("koreaexim") ? JSON.stringify([{ result: 1, cur_unit: "USD", ttb: "1", tts: "2", deal_bas_r: "1,330" }]) : "[]");
  return { collected: () => collected, d: { store, hasRates: async () => opts.has ?? false, koreaeximKey: "k", fetcher, lastRunAt: async () => opts.lastRunAt ?? null } };
}

describe("오늘 환율이 없으면 수집 (작업 0106)", () => {
  it("평일 오후 · 오늘 값 없음 · 최근 수집 없음 → 수집", async () => {
    const t = deps({ lastRunAt: "2026-10-29T03:00:30Z" });
    expect(await ensureToday(t.d, new Date("2026-10-30T06:10:00Z"))).toMatchObject({ done: true, skipped: false, status: "ok" });
    expect(t.collected()).toBe(1);
  });
  it("오늘 값이 있으면 아무것도 안 함", async () => {
    const t = deps({ has: true });
    expect(await ensureToday(t.d, new Date("2026-10-30T06:10:00Z"))).toEqual({ done: true, skipped: true });
    expect(t.collected()).toBe(0);
  });
  it("20분 안에 수집했으면 안 함 (누구나 부를 수 있어서)", async () => {
    const t = deps({ lastRunAt: "2026-10-30T06:00:00Z" });
    expect(await ensureToday(t.d, new Date("2026-10-30T06:10:00Z"))).toEqual({ done: false, why: "recent-run" });
  });
  it("주말 · 한국 11:30 전은 안 함", async () => {
    expect((await ensureToday(deps().d, new Date("2026-10-31T06:00:00Z"))).done).toBe(false);
    expect(await ensureToday(deps().d, new Date("2026-10-30T02:00:00Z"))).toEqual({ done: false, why: "too-early" });
  });
});

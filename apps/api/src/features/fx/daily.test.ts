import { describe, expect, it } from "vitest";
import type { RateStore } from "./collect";
import { dailyFx } from "./daily";

const NOW = () => new Date("2026-10-30T04:30:00Z");
const HOOK = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/test-hook";

function deps(opts: { has?: boolean; exim?: "ok" | "empty"; hook?: string; hookStatus?: number } = {}) {
  const calls: string[] = [];
  let collected = 0;
  const store: RateStore = {
    startRun: async () => 1,
    finishRun: async () => undefined,
    saveRates: async (rows) => {
      collected += rows.length;
      return rows.length;
    },
  };
  const fetcher: typeof fetch = async (u, init) => {
    const url = String(u);
    calls.push(`${init?.method ?? "GET"} ${url.includes("koreaexim") ? "koreaexim" : url === HOOK ? "hook" : "other"}`);
    if (url === HOOK) return new Response("", { status: opts.hookStatus ?? 200 });
    if (url.includes("koreaexim")) return new Response(JSON.stringify(opts.exim === "empty" ? [] : [{ result: 1, cur_unit: "USD", ttb: "1,310", tts: "1,350", deal_bas_r: "1,330" }]));
    return new Response("[]");
  };
  return { calls, collected: () => collected, d: { store, hasRates: async () => opts.has ?? false, koreaeximKey: "k", deployHook: opts.hook, fetcher, now: NOW } };
}

describe("평일 환율 예약 실행 (작업 0094)", () => {
  it("다시 하는 예약 — 오늘 값이 이미 있으면 아무것도 안 함 (수집 · 다시 빌드 둘 다)", async () => {
    const t = deps({ has: true, hook: HOOK });
    expect(await dailyFx("2026-10-30", true, t.d)).toEqual({ skipped: true });
    expect(t.calls).toEqual([]);
  });
  it("다시 하는 예약 — 오늘 값이 없으면 수집하고 사이트를 다시 빌드", async () => {
    const t = deps({ has: false, hook: HOOK });
    const r = await dailyFx("2026-10-30", true, t.d);
    expect(r).toMatchObject({ skipped: false, status: "ok", rebuild: "requested" });
    expect(t.calls).toEqual(["GET koreaexim", "POST hook"]);
  });
  it("첫 예약은 값이 있어도 수집 (수출입은행 값이 예비 값을 덮게 FX-05)", async () => {
    const t = deps({ has: true });
    expect(await dailyFx("2026-10-30", false, t.d)).toMatchObject({ skipped: false, status: "ok", rebuild: "no-hook" });
    expect(t.collected()).toBe(1);
  });
  it("받은 값이 없으면(공휴일 등) 다시 빌드하지 않음", async () => {
    const t = deps({ exim: "empty", hook: HOOK });
    expect(await dailyFx("2026-10-30", false, t.d)).toMatchObject({ status: "empty", rebuild: "not-needed" });
    expect(t.calls).not.toContain("POST hook");
  });
  it("배포 훅이 실패해도 수집 결과는 그대로", async () => {
    const t = deps({ hook: HOOK, hookStatus: 500 });
    expect(await dailyFx("2026-10-30", false, t.d)).toMatchObject({ status: "ok", rows: 1, rebuild: "failed" });
  });
});

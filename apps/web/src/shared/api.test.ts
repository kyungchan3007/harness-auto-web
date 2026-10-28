import { describe, expect, it } from "vitest";
import { api } from "./api";

const json = (body: unknown, status = 200) => async () => new Response(JSON.stringify(body), { status });

// 배포한 API 실제 응답 모양 (2026-10-28)
const LATEST = {
  date: "2026-10-28",
  rates: [{ date: "2026-10-28", currency: "USD", unit: 1, baseRate: 1324.3, ttb: 1311.4, tts: 1337.2, source: "koreaexim", fetchedAt: "2026-10-28T12:30:01.000Z" }],
};

describe("api (빌드 때 받기)", () => {
  it("정상 응답 → ok · 스키마로 검사된 값", async () => {
    const r = await api.latest({ fetcher: json(LATEST) });
    expect(r).toMatchObject({ ok: true, data: { date: "2026-10-28" } });
  });

  it("모양이 다르면 → ok false · 어디가 다른지 (지어낸 값이 화면에 안 나감)", async () => {
    const r = await api.latest({ fetcher: json({ date: "2026-10-28", rates: [{ ...LATEST.rates[0], source: "guess" }] }) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/rates\.0\.source/);
  });

  it("HTTP 오류 · 연결 실패 → 던지지 않고 ok false (빌드가 깨지지 않음)", async () => {
    expect(await api.latest({ fetcher: json({}, 503) })).toEqual({ ok: false, reason: "HTTP 503" });
    const down: typeof fetch = async () => { throw new TypeError("fetch failed"); };
    expect(await api.latest({ fetcher: down })).toEqual({ ok: false, reason: "연결 실패" });
  });

  it("시간 초과 → ok false · 시간 초과", async () => {
    const slow: typeof fetch = (_u, init) =>
      new Promise((_, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason)));
    expect(await api.latest({ fetcher: slow, timeoutMs: 20 })).toEqual({ ok: false, reason: "시간 초과" });
  });

  it("주소: 끝 / 는 떼고 경로를 붙임", async () => {
    let url = "";
    await api.signal("USD", { base: "https://x.example/", fetcher: async (u) => { url = String(u); return new Response("{}"); } });
    expect(url).toBe("https://x.example/signal/USD");
  });
});

// 실제 배포 API 확인 — 네트워크가 필요해서 평소엔 건너뜀: LIVE_API=1 npx vitest run src/shared
describe.runIf(process.env.LIVE_API === "1")("실제 배포 API", () => {
  it("네 경로 모두 스키마 검사 통과", async () => {
    for (const [name, r] of Object.entries({
      latest: await api.latest(),
      signals: await api.signals(),
      usd: await api.signal("USD"),
      prices: await api.priceLevels(),
    })) {
      expect(r, `${name}: ${r.ok ? "" : r.reason}`).toMatchObject({ ok: true });
    }
  }, 30_000);
});

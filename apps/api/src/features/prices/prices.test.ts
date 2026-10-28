import { describe, expect, it } from "vitest";
import { type PriceStore, collectPriceLevels } from "./collect";
import { combineLevels, parseCountries, parseIndicator } from "./worldbank";

const AT = "2026-10-28T00:00:00.000Z";

// 실제 응답 모양 (2026-10-28 호출 · 값 일부)
const COUNTRIES = [
  { page: 1, pages: 1, per_page: "400", total: 4 },
  [
    { id: "KOR", region: { id: "EAS" } },
    { id: "JPN", region: { id: "EAS" } },
    { id: "USA", region: { id: "NAC" } },
    { id: "WLD", region: { id: "NA" } }, // 집계 — 빼야 함
    { id: "ZWE", region: { id: "SSF" } },
  ],
];
const indicator = (rows: [string, string, number | null][]) => [
  { page: 1, pages: 1, per_page: "20000", total: rows.length, lastupdated: "2026-10-08" },
  rows.map(([c, date, value]) => ({ countryiso3code: c, date, value })),
];
const PPP = indicator([["KOR", "2025", 880.125], ["JPN", "2025", 103.337], ["USA", "2025", 1], ["WLD", "2025", 0.5], ["JPN", "2024", null], ["ZWE", "2021", 1]]);
const FX = indicator([["KOR", "2025", 1422.441], ["JPN", "2025", 149.658], ["USA", "2025", 1], ["WLD", "2025", 1], ["ZWE", "2021", 3333]]);

describe("세계은행 응답 읽기", () => {
  it("집계(Aggregates)는 나라 목록에서 뺀다", () => {
    expect([...parseCountries(COUNTRIES)].sort()).toEqual(["JPN", "KOR", "USA", "ZWE"]);
  });

  it("빈 값은 버린다", () => {
    expect(parseIndicator(PPP).get("JPN")?.has(2024)).toBe(false);
  });

  it("지표가 없어졌다는 오류 응답 → 실패로 알림 (PA.NUS.PPPC.RF 가 실제로 이랬음)", () => {
    const archived = [{ message: [{ id: "175", key: "Invalid format", value: "The indicator was not found." }] }];
    expect(() => parseIndicator(archived)).toThrow(/indicator/);
  });

  it("여러 쪽으로 나뉘면 조용히 일부만 받지 않고 실패", () => {
    expect(() => parseIndicator([{ page: 1, pages: 2, total: 40000 }, []])).toThrow(/pages=2/);
  });

  it("믿을 수 없는 값(통화 단위가 어긋난 원본 오류)은 뺀다 — 짐바브웨 0.0003 이 실제로 들어왔었음", () => {
    const rows = combineLevels(parseCountries(COUNTRIES), parseIndicator(PPP), parseIndicator(FX), AT);
    expect(rows.find((r) => r.country === "ZWE")).toBeUndefined();
  });

  it("물가 수준 = PPP ÷ 시장 환율 · 두 값이 다 있는 나라 · 연도만 (TRV-02)", () => {
    const rows = combineLevels(parseCountries(COUNTRIES), parseIndicator(PPP), parseIndicator(FX), AT);
    expect(rows.map((r) => [r.country, r.year, r.level])).toEqual([
      ["JPN", 2025, 0.6905],
      ["KOR", 2025, 0.6187],
      ["USA", 2025, 1],
    ]);
  });
});

describe("collectPriceLevels", () => {
  const store = () => {
    const runs: Record<string, unknown>[] = [];
    const s: PriceStore = {
      async startRun() { runs.push({}); return runs.length; },
      async finishRun(id, r) { Object.assign(runs[id - 1], r); },
      async saveLevels(rows) { return rows.length; },
    };
    return { s, runs };
  };
  const fetcher = (map: Record<string, unknown>, status = 200): typeof fetch => async (u) => {
    const key = Object.keys(map).find((k) => String(u).includes(k));
    return new Response(JSON.stringify(key ? map[key] : []), { status });
  };

  it("최근 5년 · 성공하면 ok", async () => {
    const { s, runs } = store();
    const r = await collectPriceLevels(s, { now: () => new Date(AT), fetcher: fetcher({ "/country?": COUNTRIES, "PA.NUS.PRVT.PP": PPP, "PA.NUS.FCRF": FX }) });
    expect(r).toMatchObject({ status: "ok", rows: 3, years: { from: 2021, to: 2026 } });
    expect(runs[0]).toMatchObject({ source: "worldbank", status: "ok" });
  });

  it("HTTP 실패 → error 로 기록", async () => {
    const { s, runs } = store();
    const r = await collectPriceLevels(s, { now: () => new Date(AT), fetcher: fetcher({}, 502) });
    expect(r.status).toBe("error");
    expect(String(runs[0].message)).toMatch(/HTTP 502/);
  });
});

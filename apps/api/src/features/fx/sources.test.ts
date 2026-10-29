import { describe, expect, it } from "vitest";
import { fetchFrankfurter, parseFrankfurter } from "./frankfurter";
import { fetchKoreaexim, parseKoreaexim, parseNumber, parseUnit } from "./koreaexim";
import { SourceError, isIsoDate, isWeekend, kstDate } from "./rate";

const AT = "2026-10-28T03:00:00.000Z";

// 공식 명세 예시 응답에서 가져온 줄 (2018-01-02)
const EXIM_SAMPLE = [
  { result: 1, cur_unit: "DEM", ttb: "0", tts: "0", deal_bas_r: "657.98" },
  { result: 1, cur_unit: "EUR", ttb: "1,274.04", tts: "1,299.77", deal_bas_r: "1,286.91" },
  { result: 1, cur_unit: "JPY(100)", ttb: "941.53", tts: "960.56", deal_bas_r: "951.05" },
  { result: 1, cur_unit: "KRW", ttb: "0", tts: "0", deal_bas_r: "1" },
  { result: 1, cur_unit: "USD", ttb: "1,056.23", tts: "1,077.56", deal_bas_r: "1,066.9" },
];

const res = (body: unknown, status = 200) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status });

describe("수출입은행 응답 읽기", () => {
  it("쉼표 섞인 글자 숫자", () => {
    expect(parseNumber("1,286.91")).toBe(1286.91);
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });

  it("100 단위 통화 (FX-04)", () => {
    expect(parseUnit("JPY(100)")).toEqual({ currency: "JPY", unit: 100 });
    expect(parseUnit("USD")).toEqual({ currency: "USD", unit: 1 });
    expect(() => parseUnit("엔")).toThrow(SourceError);
  });

  it("원화 자신 · 거래 안 하는 옛 통화는 빼고 나머지 전부", () => {
    const rows = parseKoreaexim(EXIM_SAMPLE, "2018-01-02", AT);
    expect(rows.map((r) => r.currency)).toEqual(["EUR", "JPY", "USD"]);
    expect(rows[1]).toEqual({
      date: "2018-01-02", currency: "JPY", unit: 100, baseRate: 951.05, ttb: 941.53, tts: 960.56, source: "koreaexim", fetchedAt: AT,
    });
  });

  it("비영업일 · 11시 전 (null · 빈 배열) → 데이터 없음, 실패 아님 (FX-02)", () => {
    expect(parseKoreaexim(null, "2018-01-01", AT)).toEqual([]);
    expect(parseKoreaexim([], "2018-01-01", AT)).toEqual([]);
  });

  it("RESULT 2 · 3 · 4 → 실패로 알림", () => {
    for (const code of [2, 3, 4]) {
      expect(() => parseKoreaexim([{ result: code }], "2018-01-02", AT)).toThrow(expect.objectContaining({ code: `result-${code}` }));
    }
  });

  it("키가 없으면 부르지 않고 실패 · 날짜는 YYYYMMDD 로 · 빈 응답은 데이터 없음", async () => {
    await expect(fetchKoreaexim("2018-01-02", undefined)).rejects.toMatchObject({ code: "no-key" });
    let url = "";
    const rows = await fetchKoreaexim("2018-01-02", "k", async (u) => { url = String(u); return res(""); });
    expect(url).toContain("searchdate=20180102");
    expect(url).toContain("data=AP01");
    expect(rows).toEqual([]);
  });
});

describe("Frankfurter 응답 읽기", () => {
  // 실제 응답 모양 (2026-10-28 호출)
  const SAMPLE = [
    { date: "2026-10-28", base: "KRW", quote: "EUR", rate: 0.00067407 },
    { date: "2026-10-28", base: "KRW", quote: "JPY", rate: 0.1187 },
    { date: "2026-10-28", base: "KRW", quote: "USD", rate: 0.00075274 },
  ];

  it("1 외화 = 1 / rate 원 · 송금 환율 없음", () => {
    const rows = parseFrankfurter(SAMPLE, AT);
    expect(rows.map((r) => [r.currency, r.unit, r.baseRate])).toEqual([["EUR", 1, 1483.5254], ["JPY", 100, 842.4600], ["USD", 1, 1328.48]]);
    expect(rows.every((r) => r.ttb === null && r.source === "frankfurter")).toBe(true);
  });

  it("엔 · 루피아는 수출입은행처럼 100 단위로 저장 (FX-04 · 출처가 바뀌어도 단위가 같음)", () => {
    const rows = parseFrankfurter([...SAMPLE, { date: "2026-10-28", base: "KRW", quote: "IDR", rate: 11.6 }], AT);
    const jpy = rows.find((r) => r.currency === "JPY");
    const idr = rows.find((r) => r.currency === "IDR");
    expect(jpy).toMatchObject({ unit: 100 });
    expect(idr).toMatchObject({ unit: 100, baseRate: 8.6207 });
    // 1 단위 값은 예전 저장 방식과 같음
    expect(jpy!.baseRate / jpy!.unit).toBeCloseTo(8.4246, 3);
  });

  it("출처가 준 날짜를 그대로 (요청 날짜로 바꾸지 않음)", async () => {
    const rows = await fetchFrankfurter("2026-10-25", async () => res([{ date: "2026-10-24", base: "KRW", quote: "USD", rate: 0.00075 }]));
    expect(rows[0].date).toBe("2026-10-24");
  });

  it("HTTP 실패 → SourceError", async () => {
    await expect(fetchFrankfurter("2026-10-28", async () => res("x", 503))).rejects.toMatchObject({ code: "http-503" });
  });
});

describe("날짜", () => {
  it("YYYY-MM-DD 이면서 달력에 있는 날만", () => {
    expect(isIsoDate("2026-10-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("20261028")).toBe(false);
  });
  it("주말", () => {
    expect(isWeekend("2026-10-24")).toBe(true);
    expect(isWeekend("2026-10-25")).toBe(true);
    expect(isWeekend("2026-10-26")).toBe(false);
  });
  it("한국 날짜 = UTC + 9", () => {
    expect(kstDate(new Date("2026-10-28T15:30:00Z"))).toBe("2026-10-29");
    expect(kstDate(new Date("2026-10-28T14:59:00Z"))).toBe("2026-10-28");
  });
});

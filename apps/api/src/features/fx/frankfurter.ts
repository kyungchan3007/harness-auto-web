// Frankfurter v2 (예비 출처) — 공식: frankfurter.dev · 키 없음 · 하루 · 월 한도 없음 · 상업 사용 무료
//   GET api.frankfurter.dev/v2/rates?base=KRW&date=YYYY-MM-DD → [{ date, base, quote, rate }] (1원 = rate 외화)
//   주말 · 휴일은 출처가 알려 주는 날짜를 그대로 쓴다 (요청한 날짜로 바꾸지 않음 — FX-02)
import { type RateRow, SourceError } from "./rate";

export const FRANKFURTER_URL = "https://api.frankfurter.dev/v2/rates";

type Item = { date: string; base: string; quote: string; rate: number };

/** 응답 → 환율 줄 (1 외화 = 1 / rate 원 · 송금 환율 없음) */
export function parseFrankfurter(body: unknown, fetchedAt: string): RateRow[] {
  if (!Array.isArray(body)) throw new SourceError("frankfurter", "shape", "응답이 배열이 아님");
  const rows: RateRow[] = [];
  for (const i of body as Item[]) {
    if (i.base !== "KRW" || !/^[A-Z]{3}$/.test(i.quote) || i.quote === "KRW") continue;
    if (typeof i.rate !== "number" || !(i.rate > 0)) continue;
    rows.push({
      date: i.date,
      currency: i.quote,
      unit: 1,
      baseRate: Math.round((1 / i.rate) * 10000) / 10000,
      ttb: null,
      tts: null,
      source: "frankfurter",
      fetchedAt,
    });
  }
  return rows;
}

export async function fetchFrankfurter(
  date: string,
  fetcher: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<RateRow[]> {
  const res = await fetcher(`${FRANKFURTER_URL}?base=KRW&date=${date}`);
  if (!res.ok) throw new SourceError("frankfurter", `http-${res.status}`, `HTTP ${res.status}`);
  return parseFrankfurter(await res.json(), now().toISOString());
}

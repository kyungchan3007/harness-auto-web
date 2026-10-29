// Frankfurter v2 (예비 출처) — 공식: frankfurter.dev · 키 없음 · 하루 · 월 한도 없음 · 상업 사용 무료
//   GET api.frankfurter.dev/v2/rates?base=KRW&date=YYYY-MM-DD → [{ date, base, quote, rate }] (1원 = rate 외화)
//   주말 · 휴일은 출처가 알려 주는 날짜를 그대로 쓴다 (요청한 날짜로 바꾸지 않음 — FX-02)
import { IsoDate } from "@hav/shared/date";
import { z } from "zod";
import { type RateRow, SourceError } from "./rate";

export const FRANKFURTER_URL = "https://api.frankfurter.dev/v2/rates";

/** 수출입은행과 같은 고시 단위 — 엔 · 루피아는 100 단위로 저장 (FX-04 · 출처가 바뀌어도 같은 통화는 같은 단위 · 작업 0072)
 *  예전에는 1 단위로 저장해 화면이 toUnit 으로 맞춰 그렸음 (작업 0058) — 이미 저장된 예전 줄은 그대로라 toUnit 은 남겨 둠 */
export const NOTICE_UNIT: Record<string, number> = { JPY: 100, IDR: 100 };

const Items = z.array(z.looseObject({ date: IsoDate, base: z.string(), quote: z.string(), rate: z.number() }));

/** 응답 → 환율 줄 (단위 = NOTICE_UNIT · unit 외화 = unit / rate 원 · 송금 환율 없음) */
export function parseFrankfurter(body: unknown, fetchedAt: string): RateRow[] {
  const items = Items.safeParse(body);
  if (!items.success) throw new SourceError("frankfurter", "shape", "응답 모양이 다름");
  const rows: RateRow[] = [];
  for (const i of items.data) {
    if (i.base !== "KRW" || !/^[A-Z]{3}$/.test(i.quote) || i.quote === "KRW" || !(i.rate > 0)) continue;
    const unit = NOTICE_UNIT[i.quote] ?? 1;
    rows.push({
      date: i.date,
      currency: i.quote,
      unit,
      baseRate: Math.round((unit / i.rate) * 10000) / 10000,
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

// 한국수출입은행 현재환율 API — 공식 명세: koreaexim.go.kr Open API "현재환율 API" (2026-04-28 수정본)
//   요청: oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey&searchdate&data=AP01
//   RESULT 1 성공 · 2 DATA코드 오류 · 3 인증코드 오류 · 4 일일제한횟수(1000회) 마감
//   비영업일 · 영업일 11시 이전 → null (데이터 없음 — 실패가 아님)
import { z } from "zod";
import { type RateRow, SourceError } from "./rate";

export const KOREAEXIM_URL = "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON";

const RESULT_MESSAGE: Record<number, string> = {
  2: "DATA코드 오류",
  3: "인증코드 오류 (키가 없거나 2년 지나 파기됐을 수 있음)",
  4: "일일제한횟수 마감",
};

// 응답 모양 (공식 명세) — 실패 응답은 result 만 오므로 두 단계로 읽는다
const Results = z.array(z.looseObject({ result: z.number() }));
const Item = z.looseObject({
  result: z.literal(1),
  // "JPY(100)" → { currency: "JPY", unit: 100 }
  cur_unit: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}(\(\d+\))?$/, "통화 코드 형식이 아님")
    .transform((s) => ({ currency: s.slice(0, 3), unit: Number(/\((\d+)\)/.exec(s)?.[1] ?? 1) })),
  ttb: z.string(),
  tts: z.string(),
  deal_bas_r: z.string(),
});

/** "1,286.91" → 1286.91 · 빈 값 · 숫자 아님 → null */
export function parseNumber(s: string | null | undefined): number | null {
  if (s == null) return null;
  const n = Number(String(s).replace(/,/g, "").trim());
  return String(s).trim() === "" || Number.isNaN(n) ? null : n;
}

/** "JPY(100)" → { currency: "JPY", unit: 100 } */
export function parseUnit(curUnit: string): { currency: string; unit: number } {
  const r = Item.shape.cur_unit.safeParse(curUnit);
  if (!r.success) throw new SourceError("koreaexim", "unit", `통화 코드 형식이 아님: ${curUnit}`);
  return r.data;
}

/**
 * 응답 → 환율 줄. 빼는 것:
 * - KRW 자기 자신
 * - 송금 환율이 둘 다 0 인 통화 (마르크 · 프랑처럼 유로 이전 옛 통화 등 — 지금 거래하지 않음) (가정)
 */
export function parseKoreaexim(body: unknown, date: string, fetchedAt: string): RateRow[] {
  if (body == null || (Array.isArray(body) && body.length === 0)) return []; // 데이터 없는 날
  const results = Results.safeParse(body);
  if (!results.success) throw new SourceError("koreaexim", "shape", "응답 모양이 명세와 다름");
  const bad = results.data.find((i) => i.result !== 1);
  if (bad) throw new SourceError("koreaexim", `result-${bad.result}`, RESULT_MESSAGE[bad.result] ?? `알 수 없는 RESULT ${bad.result}`);
  const items = z.array(Item).safeParse(body);
  if (!items.success) throw new SourceError("koreaexim", "unit", `응답 줄 형식이 명세와 다름: ${items.error.issues[0]?.message}`);

  const rows: RateRow[] = [];
  for (const i of items.data) {
    const { currency, unit } = i.cur_unit;
    const baseRate = parseNumber(i.deal_bas_r);
    const ttb = parseNumber(i.ttb);
    const tts = parseNumber(i.tts);
    if (currency === "KRW" || baseRate == null || baseRate <= 0) continue;
    if (!ttb && !tts) continue;
    rows.push({ date, currency, unit, baseRate, ttb, tts, source: "koreaexim", fetchedAt });
  }
  return rows;
}

export async function fetchKoreaexim(
  date: string,
  key: string | undefined,
  fetcher: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<RateRow[]> {
  if (!key) throw new SourceError("koreaexim", "no-key", "KOREAEXIM_KEY 가 설정되지 않음");
  const url = `${KOREAEXIM_URL}?authkey=${encodeURIComponent(key)}&searchdate=${date.replace(/-/g, "")}&data=AP01`;
  const res = await fetcher(url);
  if (!res.ok) throw new SourceError("koreaexim", `http-${res.status}`, `HTTP ${res.status}`);
  const text = await res.text();
  return parseKoreaexim(text.trim() === "" ? null : JSON.parse(text), date, now().toISOString());
}

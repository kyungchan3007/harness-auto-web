// 세계은행 — 나라별 물가 수준 (미국 = 1, 연 단위)
//   처음 고른 PA.NUS.PPPC.RF 는 "WDI Database Archives" 로 옮겨져 API 에서 안 나옴 (2026-10-28 직접 호출로 확인)
//   → 가계 소비 PPP(PA.NUS.PRVT.PP, 현지 통화 / 국제 달러) ÷ 시장 환율(PA.NUS.FCRF, 현지 통화 / 미국 달러) = 물가 수준
//   여행자 체감에는 GDP 전체보다 가계 소비 PPP 가 맞다 (가정)
export const WB_API = "https://api.worldbank.org/v2";
export const PPP = "PA.NUS.PRVT.PP";
export const FX = "PA.NUS.FCRF";
export const PRICE_SOURCE = `worldbank:${PPP}/${FX}`;

import { z } from "zod";

export type PriceLevelRow = { country: string; year: number; level: number; source: string; fetchedAt: string };

// 응답 모양: 정상 [메타, 데이터 | null] · 오류 [{ message }] (없어진 지표가 실제로 이렇게 옴)
const ErrorBody = z.tuple([z.looseObject({ message: z.array(z.looseObject({ value: z.string().optional() })) })]);
const Meta = z.looseObject({ pages: z.coerce.number() });
const Value = z.looseObject({ countryiso3code: z.string(), date: z.string(), value: z.number().nullable() });
const Country = z.looseObject({ id: z.string(), region: z.looseObject({ id: z.string() }) });

/** [메타, 데이터] 를 풀어 데이터만 — 오류 · 쪽 나뉨 · 모양 다름은 실패로 */
function unwrap<T extends z.ZodType>(body: unknown, row: T, what: string): z.infer<T>[] {
  const err = ErrorBody.safeParse(body);
  if (err.success) throw new Error(`세계은행 ${what}: ${JSON.stringify(err.data[0].message)}`);
  const ok = z.tuple([Meta, z.array(row).nullable()]).safeParse(body);
  if (!ok.success) throw new Error(`세계은행 ${what}: 응답 모양이 다름`);
  const [meta, rows] = ok.data;
  if (meta.pages > 1) throw new Error(`세계은행 ${what}: 한 쪽에 다 안 들어옴 (pages=${meta.pages}) — per_page 를 늘려야 함`);
  return rows ?? [];
}

/** 나라만 (지역 · 소득 묶음 같은 집계 "Aggregates" 는 뺌) */
export function parseCountries(body: unknown): Set<string> {
  return new Set(unwrap(body, Country, "country").filter((c) => c.region?.id !== "NA").map((c) => c.id));
}

/** 지표 값 → 나라 → 연도 → 값 (값이 비거나 0 이하면 버림) */
export function parseIndicator(body: unknown): Map<string, Map<number, number>> {
  const out = new Map<string, Map<number, number>>();
  for (const r of unwrap(body, Value, "indicator")) {
    if (typeof r.value !== "number" || !(r.value > 0) || !/^[A-Z]{3}$/.test(r.countryiso3code)) continue;
    const byYear = out.get(r.countryiso3code) ?? new Map<number, number>();
    byYear.set(Number(r.date), r.value);
    out.set(r.countryiso3code, byYear);
  }
  return out;
}

/** 같은 나라 · 같은 연도에 두 값이 다 있을 때만 물가 수준 (TRV-02: 지어내지 않음) */
export function combineLevels(
  countries: Set<string>,
  ppp: Map<string, Map<number, number>>,
  fx: Map<string, Map<number, number>>,
  fetchedAt: string,
): PriceLevelRow[] {
  const rows: PriceLevelRow[] = [];
  for (const [country, byYear] of ppp) {
    if (!countries.has(country)) continue;
    for (const [year, p] of byYear) {
      const f = fx.get(country)?.get(year);
      if (!f) continue;
      rows.push({ country, year, level: Math.round((p / f) * 10000) / 10000, source: PRICE_SOURCE, fetchedAt });
    }
  }
  return rows.sort((a, b) => a.country.localeCompare(b.country) || a.year - b.year);
}

export async function fetchPriceLevels(
  years: { from: number; to: number },
  fetcher: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<PriceLevelRow[]> {
  const get = async (path: string) => {
    const res = await fetcher(`${WB_API}${path}`);
    if (!res.ok) throw new Error(`세계은행 HTTP ${res.status}: ${path}`);
    return res.json();
  };
  const range = `date=${years.from}:${years.to}&format=json&per_page=20000`;
  const [countries, ppp, fx] = await Promise.all([
    get(`/country?format=json&per_page=400`),
    get(`/country/all/indicator/${PPP}?${range}`),
    get(`/country/all/indicator/${FX}?${range}`),
  ]);
  return combineLevels(parseCountries(countries), parseIndicator(ppp), parseIndicator(fx), now().toISOString());
}

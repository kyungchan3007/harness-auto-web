// 여행지 나라 표 · 물가 묶음 — 여행 물가 페이지 · 통화 상세가 같이 씀 (순수 함수 · 테스트 있음)
// 세계은행 안내대로 정밀 순위 대신 "싼 편 · 비슷 · 비싼 편" 묶음 (docs/domain/travel-price.md)
import type { Region } from "./currency";
import type { PriceLevels } from "./prices";

type Country = { name: string; flag: string; currency: string | null; region: Exclude<Region, "other"> };

/** 한국에서 여행을 많이 가는 나라 (가정) · ISO 3166-1 alpha-3 → 한국어 이름 · 국기(alpha-2) · 쓰는 통화 */
export const TRAVEL_COUNTRIES: Record<string, Country> = {
  JPN: { name: "일본", flag: "JP", currency: "JPY", region: "asia" },
  CHN: { name: "중국", flag: "CN", currency: "CNH", region: "asia" },
  TWN: { name: "대만", flag: "TW", currency: "TWD", region: "asia" },
  HKG: { name: "홍콩", flag: "HK", currency: "HKD", region: "asia" },
  MAC: { name: "마카오", flag: "MO", currency: null, region: "asia" },
  SGP: { name: "싱가포르", flag: "SG", currency: "SGD", region: "asia" },
  THA: { name: "태국", flag: "TH", currency: "THB", region: "asia" },
  VNM: { name: "베트남", flag: "VN", currency: "VND", region: "asia" },
  MYS: { name: "말레이시아", flag: "MY", currency: "MYR", region: "asia" },
  IDN: { name: "인도네시아", flag: "ID", currency: "IDR", region: "asia" },
  PHL: { name: "필리핀", flag: "PH", currency: null, region: "asia" },
  KHM: { name: "캄보디아", flag: "KH", currency: null, region: "asia" },
  LAO: { name: "라오스", flag: "LA", currency: null, region: "asia" },
  MNG: { name: "몽골", flag: "MN", currency: null, region: "asia" },
  IND: { name: "인도", flag: "IN", currency: null, region: "asia" },
  USA: { name: "미국", flag: "US", currency: "USD", region: "americas" },
  CAN: { name: "캐나다", flag: "CA", currency: "CAD", region: "americas" },
  MEX: { name: "멕시코", flag: "MX", currency: null, region: "americas" },
  GUM: { name: "괌", flag: "GU", currency: "USD", region: "americas" },
  GBR: { name: "영국", flag: "GB", currency: "GBP", region: "europe" },
  FRA: { name: "프랑스", flag: "FR", currency: "EUR", region: "europe" },
  DEU: { name: "독일", flag: "DE", currency: "EUR", region: "europe" },
  ITA: { name: "이탈리아", flag: "IT", currency: "EUR", region: "europe" },
  ESP: { name: "스페인", flag: "ES", currency: "EUR", region: "europe" },
  PRT: { name: "포르투갈", flag: "PT", currency: "EUR", region: "europe" },
  NLD: { name: "네덜란드", flag: "NL", currency: "EUR", region: "europe" },
  AUT: { name: "오스트리아", flag: "AT", currency: "EUR", region: "europe" },
  GRC: { name: "그리스", flag: "GR", currency: "EUR", region: "europe" },
  FIN: { name: "핀란드", flag: "FI", currency: "EUR", region: "europe" },
  CHE: { name: "스위스", flag: "CH", currency: "CHF", region: "europe" },
  CZE: { name: "체코", flag: "CZ", currency: null, region: "europe" },
  HUN: { name: "헝가리", flag: "HU", currency: null, region: "europe" },
  DNK: { name: "덴마크", flag: "DK", currency: "DKK", region: "europe" },
  NOR: { name: "노르웨이", flag: "NO", currency: "NOK", region: "europe" },
  SWE: { name: "스웨덴", flag: "SE", currency: "SEK", region: "europe" },
  TUR: { name: "튀르키예", flag: "TR", currency: null, region: "europe" },
  ARE: { name: "아랍에미리트", flag: "AE", currency: "AED", region: "mideast" },
  SAU: { name: "사우디아라비아", flag: "SA", currency: "SAR", region: "mideast" },
  AUS: { name: "호주", flag: "AU", currency: "AUD", region: "oceania" },
  NZL: { name: "뉴질랜드", flag: "NZ", currency: "NZD", region: "oceania" },
};

export type Band = "cheap" | "similar" | "pricey";

/** 한국 대비 0.9 미만 = 싼 편 · 1.1 초과 = 비싼 편 · 그 사이 = 비슷 (가정 · 경계는 docs/domain/travel-price.md) */
export const BAND_EDGE = { cheap: 0.9, pricey: 1.1 } as const;

export const BANDS: { id: Band; label: string }[] = [
  { id: "cheap", label: "한국보다 싼 편" },
  { id: "similar", label: "한국과 비슷" },
  { id: "pricey", label: "한국보다 비싼 편" },
];

export const bandOf = (relative: number): Band => (relative < BAND_EDGE.cheap ? "cheap" : relative > BAND_EDGE.pricey ? "pricey" : "similar");

/** 1.2 → "20% 비쌈" · 0.52 → "48% 쌈" · 반올림해 0 이면 "거의 같음" */
export function relativeText(relative: number): string {
  const pct = Math.round((relative - 1) * 100);
  if (pct === 0) return "거의 같음";
  return pct > 0 ? `${pct}% 비쌈` : `${-pct}% 쌈`;
}

export type TravelRow = PriceLevels["rows"][number] & Country & { band: Band };

/**
 * 물가 응답 → 표에 있는 나라만 · 묶음별로 싼 나라부터
 * 표에 있어도 응답에 없으면 missing 으로 (TRV-02: 지어내지 않음) · 기준 나라(한국)는 뺌
 */
export function travelBands(levels: PriceLevels): { bands: { id: Band; label: string; rows: TravelRow[] }[]; missing: string[]; years: number[] } {
  const byCountry = new Map(levels.rows.map((r) => [r.country, r]));
  const rows: TravelRow[] = [];
  const missing: string[] = [];
  for (const [code, meta] of Object.entries(TRAVEL_COUNTRIES)) {
    if (code === levels.base) continue;
    const row = byCountry.get(code);
    if (row) rows.push({ ...row, ...meta, band: bandOf(row.relative) });
    else missing.push(code);
  }
  rows.sort((a, b) => a.relative - b.relative);
  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => b - a);
  return { bands: BANDS.map((b) => ({ ...b, rows: rows.filter((r) => r.band === b.id) })).filter((b) => b.rows.length > 0), missing, years };
}

/** 통화 → 그 통화를 쓰는 여행지 나라들 (통화 상세에서 물가 링크) */
export const countriesOf = (currency: string) => Object.entries(TRAVEL_COUNTRIES).filter(([, c]) => c.currency === currency).map(([code]) => code);

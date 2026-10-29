// 통화 → 한국어 이름 · 국기 나라 · 지역 · 화면 문장 — 홈 · 통화 둘러보기 · 직구 계산기가 같이 씀 (순수 함수 · 테스트 있음)
// 예측 문구를 쓰지 않는다 (SIG-01) · API 는 코드만 준다
import type { FxRate } from "./fx";
import type { Signal } from "./signal";

// ── 표 ──
// 표에 없는 통화가 오면 "기타" 로 코드 그대로 보여 준다 (FX-03: 통화 목록을 코드에 고정하지 않음)

export type Region = "asia" | "americas" | "europe" | "mideast" | "oceania" | "other";

export const REGIONS: { id: Region; label: string }[] = [
  { id: "asia", label: "아시아" },
  { id: "americas", label: "미주" },
  { id: "europe", label: "유럽" },
  { id: "mideast", label: "중동" },
  { id: "oceania", label: "오세아니아" },
  { id: "other", label: "기타" },
];

type Meta = { name: string; flag: string; region: Exclude<Region, "other"> };

export const CURRENCIES: Record<string, Meta> = {
  JPY: { name: "엔화", flag: "JP", region: "asia" },
  CNH: { name: "위안화", flag: "CN", region: "asia" },
  CNY: { name: "위안화", flag: "CN", region: "asia" },
  HKD: { name: "홍콩 달러", flag: "HK", region: "asia" },
  TWD: { name: "대만 달러", flag: "TW", region: "asia" },
  SGD: { name: "싱가포르 달러", flag: "SG", region: "asia" },
  THB: { name: "바트", flag: "TH", region: "asia" },
  VND: { name: "동", flag: "VN", region: "asia" },
  MYR: { name: "링깃", flag: "MY", region: "asia" },
  IDR: { name: "루피아", flag: "ID", region: "asia" },
  BND: { name: "브루나이 달러", flag: "BN", region: "asia" },
  USD: { name: "달러", flag: "US", region: "americas" },
  CAD: { name: "캐나다 달러", flag: "CA", region: "americas" },
  EUR: { name: "유로", flag: "EU", region: "europe" },
  GBP: { name: "파운드", flag: "GB", region: "europe" },
  CHF: { name: "스위스 프랑", flag: "CH", region: "europe" },
  DKK: { name: "덴마크 크로네", flag: "DK", region: "europe" },
  NOK: { name: "노르웨이 크로네", flag: "NO", region: "europe" },
  SEK: { name: "스웨덴 크로나", flag: "SE", region: "europe" },
  AED: { name: "디르함", flag: "AE", region: "mideast" },
  SAR: { name: "리얄", flag: "SA", region: "mideast" },
  KWD: { name: "쿠웨이트 디나르", flag: "KW", region: "mideast" },
  BHD: { name: "바레인 디나르", flag: "BH", region: "mideast" },
  AUD: { name: "호주 달러", flag: "AU", region: "oceania" },
  NZD: { name: "뉴질랜드 달러", flag: "NZ", region: "oceania" },
};

export const currencyName = (code: string) => CURRENCIES[code]?.name ?? code;
export const currencyFlag = (code: string) => CURRENCIES[code]?.flag ?? null;
export const currencyRegion = (code: string): Region => CURRENCIES[code]?.region ?? "other";

/** 표 순서 = 여행 · 직구가 많은 통화부터 (API 는 알파벳순이라 브루나이 달러가 맨 앞에 왔음) · 표에 없는 통화는 뒤로 */
const ORDER = new Map(Object.keys(CURRENCIES).map((c, i) => [c, i]));
const rank = (code: string) => ORDER.get(code) ?? Number.MAX_SAFE_INTEGER;

/** 통화 목록 → 지역 순서대로 묶음 · 빈 지역은 빠짐 · 지역 안에서는 표 순서 */
export function groupByRegion<T extends { currency: string }>(items: T[]): { region: Region; label: string; items: T[] }[] {
  return REGIONS.map((r) => ({
    region: r.id,
    label: r.label,
    items: items.filter((i) => currencyRegion(i.currency) === r.id).sort((a, b) => rank(a.currency) - rank(b.currency) || a.currency.localeCompare(b.currency)),
  })).filter((g) => g.items.length > 0);
}

// ── 문장 · 숫자 (예전 home/copy.ts) ──
/** 첫 화면 큰 문장 */
export function headline(code: string, signal: Signal | null): string {
  const name = currencyName(code);
  const josa = /[가-힣]$/.test(name) && (name.charCodeAt(name.length - 1) - 0xac00) % 28 !== 0 ? "은" : "는";
  if (signal === "cheap") return `오늘, ${name}${josa} 싼 편입니다.`;
  if (signal === "expensive") return `오늘, ${name}${josa} 비싼 편입니다.`;
  if (signal === "normal") return `오늘, ${name}${josa} 평소 수준입니다.`;
  return `오늘, ${name}${josa} 판단할 자료가 모자랍니다.`;
}

/** 신호 옆 설명 — 과거 대비 위치만 (SIG-01 · SIG-02) */
export function percentileText(signal: Signal | null, percentile: number | null, windowDays: number): string {
  if (signal == null || percentile == null) return `최근 ${windowDays}일 자료가 모자라 신호를 내지 않았습니다`;
  if (percentile === 0) return `최근 ${windowDays}일 중 가장 낮음`;
  if (percentile === 1) return `최근 ${windowDays}일 중 가장 높음`;
  if (signal === "cheap") return `최근 ${windowDays}일 중 ${Math.round((1 - percentile) * 100)}%의 날보다 낮음`;
  if (signal === "expensive") return `최근 ${windowDays}일 중 ${Math.round(percentile * 100)}%의 날보다 높음`;
  return `최근 ${windowDays}일 가운데쯤`;
}

/** 표시용 환율 — 엔 · 루피아는 100 단위 그대로 보여 주고 단위를 붙인다 (FX-04) */
export function rateText(rate: Pick<FxRate, "baseRate" | "unit">): { value: string; unit: string } {
  return {
    value: rate.baseRate.toLocaleString("ko-KR", { minimumFractionDigits: rate.baseRate >= 100 ? 1 : 2, maximumFractionDigits: 2 }),
    unit: rate.unit === 1 ? "원" : `원 / ${rate.unit}`,
  };
}

export const SOURCE_NAME: Record<FxRate["source"], string> = { koreaexim: "한국수출입은행", frankfurter: "Frankfurter (예비)" };

// ── 통화 둘러보기 (작업 0058) ──

/** 🪙 동전 앞면 기호 — 표에 없으면 코드 그대로 */
const SYMBOLS: Record<string, string> = { USD: "$", CAD: "$", AUD: "$", NZD: "$", HKD: "$", SGD: "$", TWD: "$", BND: "$", JPY: "¥", CNH: "¥", CNY: "¥", EUR: "€", GBP: "£", THB: "฿", VND: "₫", CHF: "Fr" };
export const currencySymbol = (code: string) => SYMBOLS[code] ?? code;

type Day = { date: string; baseRate: number };

/** 받은 기록 안에서 최저 · 최고 · 처음 · 마지막 — 기록이 없으면 null (지어내지 않음) · 같은 값이면 앞 날짜 */
export function rangeOf(rates: Day[]): { min: Day; max: Day; first: Day; last: Day; count: number } | null {
  if (rates.length === 0) return null;
  const sorted = [...rates].sort((a, b) => a.date.localeCompare(b.date));
  const pick = (better: (a: number, b: number) => boolean) => sorted.reduce((m, r) => (better(r.baseRate, m.baseRate) ? r : m));
  return { min: pick((a, b) => a < b), max: pick((a, b) => a > b), first: sorted[0], last: sorted.at(-1)!, count: sorted.length };
}

/** 환산 예시 — 1 단위 통화는 100 · 100 단위 통화(엔 등)는 1,000 (FX-04: 고시 단위로 나눔) */
export function sampleText(code: string, rate: Pick<FxRate, "baseRate" | "unit">): string {
  const amount = rate.unit === 1 ? 100 : 1000;
  const won = Math.round((amount / rate.unit) * rate.baseRate);
  return `${amount.toLocaleString("ko-KR")} ${code} → ${won.toLocaleString("ko-KR")}원`;
}

/** 목록 찾기 — 이름 · 코드 (대소문자 · 띄어쓰기 무시) */
export function matchCurrency(code: string, query: string): boolean {
  const q = query.replace(/\s/g, "").toLowerCase();
  if (!q) return true;
  return code.toLowerCase().includes(q) || currencyName(code).replace(/\s/g, "").toLowerCase().includes(q);
}

/** 기록을 화면 단위로 맞춤 — 예비 출처(Frankfurter)는 엔도 1 단위로 와서, 그대로 이으면 100배 떨어져 보였음 (FX-04) */
export function toUnit<T extends { baseRate: number; unit: number }>(rates: T[], unit: number): T[] {
  return rates.map((r) => (r.unit === unit ? r : { ...r, baseRate: (r.baseRate / r.unit) * unit, unit }));
}

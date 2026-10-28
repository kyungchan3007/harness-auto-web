// 통화 → 한국어 이름 · 국기 나라 · 지역 — 화면이 쓰는 표 (API 는 코드만 준다)
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

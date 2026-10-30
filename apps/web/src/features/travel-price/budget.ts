// 여행 예산 어림 — "한국에서 하루 이만큼 쓰는 생활이면 그 나라에선 얼마" (작업 0088)
//   물가 수준(한국 = 1) 을 곱하기만 함 · 현지 통화는 오늘 매매기준율(1 외화당 원)로 나눔 — 둘 중 없는 값은 지어내지 않고 null (TRV-02)
//   나라 전체 가계 소비 평균이라 숙소 · 도시에 따라 다름 — 화면에 같이 적음

export type Budget = { dailyWon: number; totalWon: number; dailyLocal: number | null; totalLocal: number | null };

/**
 * @param dailyWon 한국에서 하루 쓰는 돈 (원)
 * @param relative 그 나라 물가 ÷ 한국 물가 (1.2 = 20% 비쌈)
 * @param wonPerOne 그 나라 통화 1단위당 원 (없으면 null)
 */
export function budgetOf(dailyWon: number, days: number, relative: number, wonPerOne: number | null): Budget {
  // 하루 값을 천 원 단위로 먼저 반올림 — 화면의 "하루 × 일수" 와 "전체" 가 어긋나지 않게 (112,000 × 4 = 448,000)
  const d = Math.round((dailyWon * relative) / 1000) * 1000;
  const local = wonPerOne != null && wonPerOne > 0 ? d / wonPerOne : null;
  return { dailyWon: d, totalWon: d * days, dailyLocal: local, totalLocal: local == null ? null : local * days };
}

/** 원은 천 원 단위로 반올림 (어림값이라 끝자리가 의미 없음) · 현지 통화는 정수 (1 미만 통화는 소수 둘째 자리) */
export const wonText = (v: number) => `${(Math.round(v / 1000) * 1000).toLocaleString("ko-KR")}원`;
export const localText = (v: number, code: string) =>
  `${v.toLocaleString("ko-KR", { maximumFractionDigits: v < 100 ? 2 : 0 })} ${code}`;

/** 하루 예산 · 일수 입력 — 쉼표 허용 · 0 이하 · 숫자 아님은 null · 일수는 1 ~ 90 정수 */
export function parseDaily(s: string): number | null {
  const t = s.replace(/[,\s]/g, "");
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n > 0 ? n : null;
}
export function parseDays(s: string): number | null {
  const t = s.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n >= 1 && n <= 90 ? n : null;
}

// 환율 계산기 계산 — 원 ↔ 외화 (작업 0086) · 화면 상태에만 · 보내지 않음
//   매매기준율(base) 로 바꾸고, 수출입은행 송금 환율(tts · ttb)이 있으면 "실제로 바꿀 때" 가까운 값을 같이
//   tts = 은행이 외화를 팔 때(내가 외화를 살 때) · ttb = 은행이 외화를 살 때(내가 외화를 팔 때)
import type { FxRate } from "@hav/shared/fx";

export type Side = "won" | "foreign";
type Rate = Pick<FxRate, "baseRate" | "unit" | "ttb" | "tts">;

/** 1 외화당 원 (엔처럼 100 단위 고시도 같은 기준으로) */
const perOne = (r: Rate, v: number) => v / r.unit;

/** from 쪽 금액을 반대쪽 금액으로 — 매매기준율 */
export function convert(amount: number, from: Side, r: Rate): number {
  const k = perOne(r, r.baseRate);
  return from === "won" ? amount / k : amount * k;
}

/**
 * 송금 환율로 바꾼 값 — 원 → 외화는 내가 외화를 사니 tts · 외화 → 원은 내가 파니 ttb
 * 그 값이 없으면(예비 출처 Frankfurter) null
 */
export function convertRemit(amount: number, from: Side, r: Rate): number | null {
  const v = from === "won" ? r.tts : r.ttb;
  if (v == null || v <= 0) return null;
  const k = perOne(r, v);
  return from === "won" ? amount / k : amount * k;
}

/** 빠른 금액 단추 — 원은 1만 ~ 50만 · 외화는 고시 단위에 맞춰 (엔: 1,000 ~ 50,000) */
export const presets = (side: Side, r: Pick<FxRate, "unit">) => (side === "won" ? [10_000, 50_000, 100_000, 500_000] : [10, 50, 100, 500].map((x) => x * r.unit));

/** 원은 정수 · 100 단위 통화(엔 · 루피아)는 정수 · 나머지 외화는 소수 둘째 자리 */
export function amountText(v: number, side: Side, r: Pick<FxRate, "unit">): string {
  const digits = side === "won" || r.unit !== 1 ? 0 : 2;
  return v.toLocaleString("ko-KR", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

/** "12,345.6" · " 20 " → 숫자 · 빈 칸 · 숫자 아님 · 음수는 null */
export function parseInput(s: string): number | null {
  const t = s.replace(/[,\s]/g, "");
  if (!/^\d*\.?\d+$|^\d+\.$/.test(t)) return null;
  return Number(t);
}

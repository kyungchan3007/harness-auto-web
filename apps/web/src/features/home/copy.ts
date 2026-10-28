// 홈 문장 · 숫자 — 순수 함수 (테스트 대상) · 예측 문구를 쓰지 않는다 (SIG-01)
import type { FxRate } from "@hav/shared/fx";
import type { Signal } from "@hav/shared/signal";

import { currencyName } from "./currencies";

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

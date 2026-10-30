// 통화 페이지 설명 글 — 검색 결과 · 공유 미리보기 밑글 (작업 0093)
//   기준일을 꼭 같이 — 미리보기는 캐시돼 오래 남아서 날짜 없는 숫자는 "오늘 값" 으로 오해됨 (FX-01 · FX-02)
import { currencyName, rateText } from "@hav/shared/currency";
import type { FxRate } from "@hav/shared/fx";
import type { Signal } from "@hav/shared/signal";

const LABEL: Record<Signal, string> = { cheap: "최근 90일 중 싼 편", normal: "최근 90일 중 보통", expensive: "최근 90일 중 비싼 편" };

export function describeCurrency(code: string, rate: Pick<FxRate, "date" | "baseRate" | "unit"> | null, signal: Signal | null): string {
  const name = `${currencyName(code)}(${code})`;
  if (!rate) return `${name} 환율 · 1년 흐름 · 환율 계산기 — Tripfx`;
  const t = rateText(rate);
  const where = signal ? ` · ${LABEL[signal]} (예측 아님)` : "";
  return `${name} ${rate.date} 기준 ${t.value}${t.unit}${where} · 원 ↔ ${code} 환율 계산기 · 1개월 ~ 1년 흐름`;
}

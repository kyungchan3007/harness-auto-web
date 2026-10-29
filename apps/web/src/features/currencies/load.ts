// 빌드 때 받기 — 통화 하나의 상세 (오늘 환율은 /fx/latest 에서 · 신호 · 1년 기록)
import { api } from "@/shared/api";
import type { DetailData } from "./currency-detail";

export async function loadDetail(code: string): Promise<DetailData> {
  const [latest, signal, history] = await Promise.all([api.latest(), api.signal(code), api.history(code, 365)]);
  const rate = latest.ok ? (latest.data.rates.find((r) => r.currency === code) ?? null) : null;
  return { code, rate, signal, history, problem: latest.ok ? null : latest.reason };
}

// 통화마다 기간 변화율 — 기간 처음 → 마지막 (작업 0096) · 홈 통화 칸의 "1개월 -1.7%"
//   빌드가 통화 22개의 1년치를 따로 받지 않게 한 번에 · 응답은 읽기 캐시(api_cache)
import type { FxChange } from "@hav/shared/fx";

type Row = { currency: string; date: string; baseRate: number; unit: number };

/** 날짜 오름차순이 아니어도 됨 · 통화별 첫날 → 마지막 날 · 기록 두 날 미만이면 뺌 · 통화 이름순 */
export function changesOf(rows: Row[]): FxChange[] {
  const by = new Map<string, Row[]>();
  for (const r of rows) by.set(r.currency, [...(by.get(r.currency) ?? []), r]);
  const out: FxChange[] = [];
  for (const [currency, list] of by) {
    if (list.length < 2) continue;
    list.sort((a, b) => a.date.localeCompare(b.date));
    const first = list[0];
    const last = list[list.length - 1];
    const from = { date: first.date, value: first.baseRate / first.unit };
    const to = { date: last.date, value: last.baseRate / last.unit };
    out.push({ currency, from, to, pct: ((to.value - from.value) / from.value) * 100 });
  }
  return out.sort((a, b) => a.currency.localeCompare(b.currency));
}

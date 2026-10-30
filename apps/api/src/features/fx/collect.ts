// 하루치 환율 수집 — 수출입은행 먼저, "실패"면 Frankfurter 예비 (데이터 없는 날은 넘어가지 않음)
import { fetchFrankfurter } from "./frankfurter";
import { fetchKoreaexim } from "./koreaexim";
import { type RateRow, SourceError, isWeekend } from "./rate";

/** 저장하는 쪽 — D1 구현은 store.ts, 테스트는 메모리 */
export interface RateStore {
  startRun(source: string, startedAt: string): Promise<number>;
  finishRun(id: number, r: { source: string; status: "ok" | "empty" | "error"; rows: number; message: string | null; finishedAt: string }): Promise<void>;
  /** koreaexim 은 덮어쓰고, frankfurter 는 이미 있는 줄을 건드리지 않는다 (공식 원화 환율 우선) */
  saveRates(rows: RateRow[]): Promise<number>;
  /** 공식 출처(수출입은행)가 최근에 준 통화 — 예비는 이 통화만 채움 (작업 0098) · 없거나 빈 목록이면 거르지 않음 (처음 수집) */
  officialCurrencies?(): Promise<string[]>;
}

export type CollectResult = { date: string; status: "ok" | "empty" | "error"; source: string; rows: number; message: string | null };

export async function collectDay(
  store: RateStore,
  date: string,
  opts: { koreaeximKey?: string; fetcher?: typeof fetch; now?: () => Date } = {},
): Promise<CollectResult> {
  const now = opts.now ?? (() => new Date());
  const runId = await store.startRun("koreaexim", now().toISOString());
  let source = "koreaexim";
  let message: string | null = null;

  const finish = async (status: CollectResult["status"], rows: number) => {
    await store.finishRun(runId, { source, status, rows, message, finishedAt: now().toISOString() });
    return { date, status, source, rows, message };
  };

  try {
    let rows: RateRow[];
    try {
      rows = await fetchKoreaexim(date, opts.koreaeximKey, opts.fetcher, now);
    } catch (e) {
      if (!(e instanceof SourceError)) throw e;
      // 수출입은행 실패 → 예비. 수출입은행처럼 영업일만: 주말은 채우지 않고, 요청한 날짜의 줄만 쓴다 (FX-02)
      message = `koreaexim ${e.code}: ${e.message}`;
      source = "koreaexim→frankfurter";
      rows = isWeekend(date) ? [] : (await fetchFrankfurter(date, opts.fetcher, now)).filter((r) => r.date === date);
      // 예비는 통화가 160개 넘게 와서, 그날만 목록이 22개 → 160개로 늘어남 — 공식 출처가 주던 통화만 (FX-03 은 공식 출처 기준 · 작업 0098)
      const known = new Set((await store.officialCurrencies?.()) ?? []);
      if (known.size > 0) rows = rows.filter((r) => known.has(r.currency));
    }
    if (rows.length === 0) return finish("empty", 0);
    return finish("ok", await store.saveRates(rows));
  } catch (e) {
    message = [message, e instanceof Error ? e.message : String(e)].filter(Boolean).join(" / ");
    return finish("error", 0);
  }
}

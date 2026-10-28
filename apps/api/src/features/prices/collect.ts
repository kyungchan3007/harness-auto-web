// 물가 수준 수집 — 연 단위 자료라 월 1회면 충분 (최근 5년치를 매번 다시 받아 덮어씀: 세계은행이 과거 값을 고치기도 함)
import { type PriceLevelRow, fetchPriceLevels } from "./worldbank";

export interface PriceStore {
  startRun(source: string, startedAt: string): Promise<number>;
  finishRun(id: number, r: { source: string; status: "ok" | "empty" | "error"; rows: number; message: string | null; finishedAt: string }): Promise<void>;
  saveLevels(rows: PriceLevelRow[]): Promise<number>;
}

export async function collectPriceLevels(
  store: PriceStore,
  opts: { fetcher?: typeof fetch; now?: () => Date; years?: number } = {},
) {
  const now = opts.now ?? (() => new Date());
  const to = now().getUTCFullYear();
  const from = to - (opts.years ?? 5);
  const runId = await store.startRun("worldbank", now().toISOString());
  const finish = async (status: "ok" | "empty" | "error", rows: number, message: string | null) => {
    await store.finishRun(runId, { source: "worldbank", status, rows, message, finishedAt: now().toISOString() });
    return { status, rows, message, years: { from, to } };
  };
  try {
    const rows = await fetchPriceLevels({ from, to }, opts.fetcher, now);
    if (rows.length === 0) return finish("empty", 0, null);
    return finish("ok", await store.saveLevels(rows), null);
  } catch (e) {
    return finish("error", 0, e instanceof Error ? e.message : String(e));
  }
}

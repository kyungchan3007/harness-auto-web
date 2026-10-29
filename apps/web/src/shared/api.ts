// API 받기 — 빌드 때 부르고 @hav/shared 스키마로 검사 · 실패해도 던지지 않고 이유를 돌려준다 (빌드가 깨지지 않게)
import { FxHistory, FxLatest } from "@hav/shared/fx";
import { PriceLevels } from "@hav/shared/prices";
import { CurrencySignal, SignalList } from "@hav/shared/signal";
import { TasksSummary } from "@hav/shared/tasks";
import type { z } from "zod";

export const DEFAULT_API = "https://tripfx-api.developfff.workers.dev";

export type Fetched<T> = { ok: true; data: T } | { ok: false; reason: string };

export type ApiOptions = { base?: string; fetcher?: typeof fetch; timeoutMs?: number; headers?: Record<string, string> };

const apiBase = (base?: string) => (base ?? process.env.TRIPFX_API_URL ?? DEFAULT_API).replace(/\/$/, "");

/** 한 경로를 받아 스키마로 검사 — 연결 실패 · 시간 초과 · HTTP 오류 · 모양 다름은 모두 { ok: false } */
export async function getJson<T extends z.ZodType>(path: string, schema: T, opts: ApiOptions = {}): Promise<Fetched<z.infer<T>>> {
  const url = `${apiBase(opts.base)}${path}`;
  try {
    const res = await (opts.fetcher ?? fetch)(url, { headers: opts.headers, signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000) });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const parsed = schema.safeParse(await res.json());
    if (!parsed.success) return { ok: false, reason: `응답 모양이 다름: ${parsed.error.issues[0]?.path.join(".")} ${parsed.error.issues[0]?.message}` };
    return { ok: true, data: parsed.data };
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    return { ok: false, reason: name === "TimeoutError" ? "시간 초과" : "연결 실패" };
  }
}

export const api = {
  latest: (o?: ApiOptions) => getJson("/fx/latest", FxLatest, o),
  history: (currency: string, days: number, o?: ApiOptions) => getJson(`/fx/${encodeURIComponent(currency)}/history?days=${days}`, FxHistory, o),
  signals: (o?: ApiOptions) => getJson("/signal", SignalList, o),
  signal: (currency: string, o?: ApiOptions) => getJson(`/signal/${encodeURIComponent(currency)}`, CurrencySignal, o),
  priceLevels: (o?: ApiOptions) => getJson("/prices/levels?base=KOR", PriceLevels, o),
  tasks: (o?: ApiOptions) => getJson("/tasks", TasksSummary, o),
};

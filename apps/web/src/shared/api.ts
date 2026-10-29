// API 받기 — 빌드 때 부르고 @hav/shared 스키마로 검사 · 실패해도 던지지 않고 이유를 돌려준다 (빌드가 깨지지 않게)
import { FxHistory, FxLatest } from "@hav/shared/fx";
import { PriceLevels } from "@hav/shared/prices";
import { CurrencySignal, SignalList } from "@hav/shared/signal";
import { TasksSummary } from "@hav/shared/tasks";
import type { z } from "zod";

export const DEFAULT_API = "https://tripfx-api.developfff.workers.dev";

export type Fetched<T> = { ok: true; data: T } | { ok: false; reason: string };

export type ApiOptions = { base?: string; fetcher?: typeof fetch; timeoutMs?: number; headers?: Record<string, string>; retries?: number; retryDelayMs?: number };

const apiBase = (base?: string) => (base ?? process.env.TRIPFX_API_URL ?? DEFAULT_API).replace(/\/$/, "");

/** 다시 받아 볼 만한 실패 — 연결 끊김 · 시간 초과 · 서버 오류 · 너무 많은 요청 (모양 다름 · 4xx 는 다시 해도 같아서 바로 실패) */
const retryable = (reason: string) => reason === "연결 실패" || reason === "시간 초과" || /^HTTP (5\d\d|429)$/.test(reason);

/**
 * 한 경로를 받아 스키마로 검사 — 연결 실패 · 시간 초과 · HTTP 오류 · 모양 다름은 모두 { ok: false }
 * 빌드 때 운영 API 연결이 가끔 끊겨(ECONNRESET) 통화 페이지가 달러 하나만 만들어진 적이 있어 짧게 두 번 더 받아 봄 (작업 0076)
 */
export async function getJson<T extends z.ZodType>(path: string, schema: T, opts: ApiOptions = {}): Promise<Fetched<z.infer<T>>> {
  const { retries = 2, retryDelayMs = 500 } = opts;
  let last = await getOnce(path, schema, opts);
  for (let i = 0; i < retries && !last.ok && retryable(last.reason); i++) {
    await new Promise((r) => setTimeout(r, retryDelayMs * (i + 1)));
    last = await getOnce(path, schema, opts);
  }
  return last;
}

async function getOnce<T extends z.ZodType>(path: string, schema: T, opts: ApiOptions): Promise<Fetched<z.infer<T>>> {
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

/**
 * 운영 배포 빌드(Cloudflare Pages · main)에서 꼭 필요한 자료를 못 받으면 빌드를 멈춤 — 실패한 빌드는 배포되지 않아 예전 사이트가 그대로 남음
 * 2026-10-29 D1 읽기 한도 초과로 API 가 500 일 때, 그대로 빌드하면 멀쩡한 사이트를 "자료 없음" 으로 덮을 뻔했음 (작업 0076)
 * 미리보기 · 로컬 빌드는 지금처럼 "자료 없음" 화면으로 (FX-02)
 */
export function mustHave<T>(f: Fetched<T>, what: string, env: Record<string, string | undefined> = process.env): Fetched<T> {
  if (!f.ok && env.CF_PAGES === "1" && env.CF_PAGES_BRANCH === "main") throw new Error(`운영 빌드 멈춤: ${what} 을 받지 못함 (${f.reason}) — 예전 배포를 그대로 둠`);
  return f;
}

export const api = {
  latest: (o?: ApiOptions) => getJson("/fx/latest", FxLatest, o),
  history: (currency: string, days: number, o?: ApiOptions) => getJson(`/fx/${encodeURIComponent(currency)}/history?days=${days}`, FxHistory, o),
  signals: (o?: ApiOptions) => getJson("/signal", SignalList, o),
  signal: (currency: string, o?: ApiOptions) => getJson(`/signal/${encodeURIComponent(currency)}`, CurrencySignal, o),
  priceLevels: (o?: ApiOptions) => getJson("/prices/levels?base=KOR", PriceLevels, o),
  tasks: (o?: ApiOptions) => getJson("/tasks", TasksSummary, o),
};

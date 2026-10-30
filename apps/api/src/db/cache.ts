// 읽기 응답 캐시 (api_cache) — 사이트 빌드는 매번 통화 수십 개의 1년치 · 신호를 받음 (작업 0083)
//   2026-10-29 빌드 수십 번에 D1 하루 읽기 한도(500만 줄)를 넘겨 API 가 멈춤 → 같은 날 · 같은 코드 · 같은 자료면 저장한 응답 한 줄만 읽음
//   키 = 배포 버전 | UTC 날짜 | 경로?쿼리 — 코드를 새로 배포하거나 날짜가 바뀌면(신호 · 1년치의 "오늘 기준") 새 키
//   환율 · 물가를 저장하면 통째로 비움 (clearApiCache) → 새 자료가 바로 보임
//   캐시가 고장 나도(표 없음 · 오류) 원래대로 DB 를 읽어 응답함 — 캐시 때문에 API 가 멈추지 않게
import type { MiddlewareHandler } from "hono";
import type { Env } from "../env";

export const cacheKey = (version: string, day: string, url: string) => {
  const u = new URL(url);
  return `${version}|${day}|${u.pathname}${u.search}`;
};

const today = () => new Date().toISOString().slice(0, 10);

/** 지금이 속한 구간 — 하루(기본) 또는 bucketMs 단위 (예: 5분) */
const bucketOf = (bucketMs?: number) => (bucketMs ? new Date(Math.floor(Date.now() / bucketMs) * bucketMs).toISOString().slice(0, 16) : today());

/** GET 응답 캐시 — 200 만 저장 · 응답 머리에 x-cache: hit | miss
 *  bucketMs: 하루보다 자주 바뀌는 응답(사이트 상태 · 작업 0105)은 그 구간마다 새로 — 보는 사람이 많아도 구간마다 D1 을 한 번만 */
export function cached(opts: { bucketMs?: number } = {}): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const key = cacheKey(c.env.CF_VERSION_METADATA?.id ?? "dev", bucketOf(opts.bucketMs), c.req.url);
    const hit = await safe(() => c.env.DB.prepare("select body from api_cache where key = ?").bind(key).first<{ body: string }>());
    if (hit) return c.body(hit.body, 200, { "content-type": "application/json; charset=UTF-8", "x-cache": "hit" });
    await next();
    if (c.res.status !== 200) return;
    const body = await c.res.clone().text();
    await safe(() => c.env.DB.prepare("insert or replace into api_cache (key, body, saved_at) values (?, ?, ?)").bind(key, body, new Date().toISOString()).run());
    c.res.headers.set("x-cache", "miss");
  };
}

/** 자료가 바뀌면 모든 캐시를 지움 — 환율 · 물가 저장 뒤 */
export async function clearApiCache(d1: D1Database) {
  await safe(() => d1.prepare("delete from api_cache").run());
}

async function safe<T>(f: () => Promise<T>): Promise<T | null> {
  try {
    return await f();
  } catch {
    return null;
  }
}

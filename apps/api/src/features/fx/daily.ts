// 평일 환율 예약 실행 — 수집 · 놓친 날 다시 · 수집되면 사이트 다시 빌드 (작업 0094)
//   2026-10-30 12:00 KST 예약 수집이 아예 돌지 않음 (02:56 UTC 에 Worker 를 배포 — 예약 바뀜이 퍼지는 동안 놓친 것으로 봄)
//   → 13:30 · 15:00 KST 에 "오늘 값이 없으면" 다시 수집 · 이미 있으면 아무것도 안 함 (D1 한 줄 읽기)
//   → 새 값을 저장하면 Pages 배포 훅을 바로 부름 — GitHub 예약(rebuild-site)은 몇 시간씩 늦어서 예비로만
import { type CollectResult, type RateStore, collectDay } from "./collect";

export type DailyDeps = {
  store: RateStore;
  /** 그 날짜(한국 날짜) 환율이 이미 저장됐는지 */
  hasRates: (date: string) => Promise<boolean>;
  koreaeximKey?: string;
  /** Cloudflare Pages 배포 훅 주소 — 없으면 다시 빌드 안 함 */
  deployHook?: string;
  fetcher?: typeof fetch;
  now?: () => Date;
};

export type DailyResult = { skipped: true } | (CollectResult & { skipped: false; rebuild: "requested" | "no-hook" | "failed" | "not-needed" });

/** retry=true(다시 하는 예약)는 오늘 값이 이미 있으면 건너뜀 · 첫 예약은 항상 수집 (수출입은행 값이 예비 값을 덮게 FX-05) */
export async function dailyFx(date: string, retry: boolean, deps: DailyDeps): Promise<DailyResult> {
  if (retry && (await deps.hasRates(date))) return { skipped: true };
  const r = await collectDay(deps.store, date, { koreaeximKey: deps.koreaeximKey, fetcher: deps.fetcher, now: deps.now });
  if (r.status !== "ok" || r.rows === 0) return { ...r, skipped: false, rebuild: "not-needed" };
  if (!deps.deployHook) return { ...r, skipped: false, rebuild: "no-hook" };
  try {
    const res = await (deps.fetcher ?? fetch)(deps.deployHook, { method: "POST" });
    return { ...r, skipped: false, rebuild: res.ok ? "requested" : "failed" };
  } catch {
    return { ...r, skipped: false, rebuild: "failed" };
  }
}

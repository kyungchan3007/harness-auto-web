// 예약(cron) 직전 배포 막기 — 배포마다 예약을 다시 거는데, 직전에 배포하면 그 회차를 놓침 (작업 0094 · 0096 · 0097)
//   2026-10-30 02:56 UTC 배포 뒤 03:00 수집이 돌지 않았음
//   사용: node apps/api/scripts/cron-window.mjs → 다음 예약까지 남은 초 (GUARD_MIN 분 안이면) 또는 0 · deploy-api 가 그만큼 기다림
import { readFileSync } from "node:fs";

export const GUARD_MIN = 16;

/** "1-5" · "*" · "3" · "1,3" 중 하나에 맞는지 */
function match(field, value) {
  if (field === "*") return true;
  return field.split(",").some((part) => {
    const [a, b] = part.split("-").map(Number);
    return b === undefined ? value === a : value >= a && value <= b;
  });
}

/** cron 5칸(분 시 일 월 요일 · UTC)이 그 분에 도는지 */
export function fires(cron, d) {
  const [m, h, dom, mon, dow] = cron.trim().split(/\s+/);
  return match(m, d.getUTCMinutes()) && match(h, d.getUTCHours()) && match(dom, d.getUTCDate()) && match(mon, d.getUTCMonth() + 1) && match(dow, d.getUTCDay());
}

/** now 부터 GUARD_MIN 분 안에 도는 예약이 있으면 그 시각 + 2분까지 남은 초 · 없으면 0 */
export function waitSeconds(crons, now = new Date(), guardMin = GUARD_MIN) {
  const start = new Date(Math.floor(now.getTime() / 60_000) * 60_000);
  for (let i = 0; i <= guardMin; i++) {
    const t = new Date(start.getTime() + i * 60_000);
    if (t.getTime() < now.getTime() - 59_000) continue;
    if (crons.some((c) => fires(c, t))) return Math.max(0, Math.ceil((t.getTime() + 2 * 60_000 - now.getTime()) / 1000));
  }
  return 0;
}

/** wrangler.jsonc 의 "crons": [...] */
export function cronsOf(jsonc) {
  const m = /"crons":\s*(\[[^\]]*\])/.exec(jsonc);
  return m ? JSON.parse(m[1]) : [];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const crons = cronsOf(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
  console.log(waitSeconds(crons));
}

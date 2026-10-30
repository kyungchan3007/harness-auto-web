// 사이트 상태 점검판 계약 — GET /status (작업 0105) · 만드는 중 페이지 맨 위
//   수집 기록(fetch_runs)에서 시각 · 결과 · 통화 수 · 이유 분류만 — 원본 메시지는 내보내지 않음
import { z } from "zod";
import { IsoDate, IsoDateTime } from "./date";

/** 실패 이유 분류 — 수집 코드가 남기는 "출처 코드:" 앞부분 (no-key · http-500 · shape …) · 모르면 null */
export const RunReason = z.string().regex(/^[a-z0-9-]{1,32}$/).nullable();

export const StatusRun = z.object({
  at: IsoDateTime,
  source: z.string(), // koreaexim · koreaexim→frankfurter · worldbank
  status: z.enum(["running", "ok", "empty", "error"]),
  rows: z.number().int().nonnegative(),
  reason: RunReason,
});
export type StatusRun = z.infer<typeof StatusRun>;

/** 오늘 예약 회차 — done: 수집함 · empty: 돌았지만 값 없음(공휴일 등) · error: 실패 · missed: 안 돎 · not-needed: 이미 값이 있어 다시 안 함 · upcoming: 아직 */
export const SlotState = z.enum(["done", "empty", "error", "missed", "not-needed", "upcoming"]);
export type SlotState = z.infer<typeof SlotState>;
export const StatusSlot = z.object({ time: z.string().regex(/^\d{2}:\d{2}$/), kind: z.enum(["collect", "retry"]), state: SlotState });
export type StatusSlot = z.infer<typeof StatusSlot>;

export const SiteStatus = z.object({
  /** 한국 날짜 · 지금 */
  today: IsoDate,
  now: IsoDateTime,
  /** 저장된 가장 최근 환율 날짜 */
  latestDate: IsoDate.nullable(),
  /** 마지막 환율 수집 (오늘이 아니어도) */
  lastRun: StatusRun.nullable(),
  /** 오늘(한국 날짜) 환율 수집들 · 최근 것부터 */
  todayRuns: z.array(StatusRun),
  /** 오늘 예약 회차 — 주말은 빈 목록 */
  schedule: z.array(StatusSlot),
});
export type SiteStatus = z.infer<typeof SiteStatus>;

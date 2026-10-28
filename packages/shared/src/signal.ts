// 신호 API 계약 — 계산 규칙은 apps/api/src/features/signal/signal.ts
import { z } from "zod";
import { IsoDate } from "./date";

export const Signal = z.enum(["cheap", "normal", "expensive"]);
export type Signal = z.infer<typeof Signal>;

export const SignalRule = z.object({
  windowDays: z.number().int().positive(),
  cheapAt: z.number().min(0).max(1),
  expensiveAt: z.number().min(0).max(1),
  minCoverage: z.number().min(0).max(1),
});
export type SignalRule = z.infer<typeof SignalRule>;

export const Point = z.object({ date: IsoDate, value: z.number().positive() });
export type Point = z.infer<typeof Point>;

export const SignalReason = z.enum(["ok", "no-data", "data-short"]);

export const SignalResult = z.object({
  signal: Signal.nullable(),
  reason: SignalReason,
  percentile: z.number().min(0).max(1).nullable(),
  latest: Point.nullable(),
  window: z.object({ from: IsoDate, to: IsoDate, count: z.number().int(), expected: z.number().int() }).nullable(),
  range: z.object({ min: z.number(), max: z.number() }).nullable(),
  method: z.string(), // SIG-02: 계산 방법을 항상 같이
});
export type SignalResult = z.infer<typeof SignalResult>;

/** GET /signal/:currency */
export const CurrencySignal = SignalResult.extend({ currency: z.string().length(3), rule: SignalRule });
export type CurrencySignal = z.infer<typeof CurrencySignal>;

/** GET /signal — 전체 통화 요약 */
export const SignalList = z.object({
  rule: SignalRule,
  signals: z.array(
    z.object({ currency: z.string().length(3), signal: Signal.nullable(), reason: SignalReason, percentile: z.number().nullable(), latest: Point.nullable() }),
  ),
});
export type SignalList = z.infer<typeof SignalList>;

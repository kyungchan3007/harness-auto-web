// 환율 API 계약 — 요청 검사(API) · 응답 검사(화면)에 같은 스키마를 쓴다
import { z } from "zod";
import { IsoDate, IsoDateTime } from "./date";

/** ISO 4217 통화 코드 — 소문자로 와도 대문자로 (usd → USD) */
export const CurrencyCode = z
  .string()
  .regex(/^[A-Za-z]{3}$/, "통화 코드는 영문 3글자")
  .transform((s) => s.toUpperCase());

export const CurrencyParam = z.object({ currency: CurrencyCode });

export const RateSource = z.enum(["koreaexim", "frankfurter"]);

export const FxRate = z.object({
  date: IsoDate,
  currency: z.string().length(3),
  unit: z.number().int().positive(), // 엔 · 루피아 100 (FX-04)
  baseRate: z.number().positive(), // unit 당 원
  ttb: z.number().nullable(),
  tts: z.number().nullable(),
  source: RateSource, // FX-01
  fetchedAt: IsoDateTime,
});
export type FxRate = z.infer<typeof FxRate>;

/** GET /fx/latest — 아직 수집 전이면 date null · rates [] */
export const FxLatest = z.object({ date: IsoDate.nullable(), rates: z.array(FxRate) });
export type FxLatest = z.infer<typeof FxLatest>;

export const FxHistoryQuery = z.object({ days: z.coerce.number().int().min(1).max(1000).default(365) });

/** GET /fx/:currency/history */
export const FxHistory = z.object({
  currency: z.string().length(3),
  since: IsoDate,
  rates: z.array(FxRate.pick({ date: true, unit: true, baseRate: true, ttb: true, tts: true, source: true })),
});
export type FxHistory = z.infer<typeof FxHistory>;

export const CollectQuery = z.object({ date: IsoDate.optional() });

/** POST /fx/collect (관리) */
export const CollectResult = z.object({
  date: IsoDate,
  status: z.enum(["ok", "empty", "error"]),
  source: z.string(),
  rows: z.number().int().nonnegative(),
  message: z.string().nullable(),
});
export type CollectResult = z.infer<typeof CollectResult>;

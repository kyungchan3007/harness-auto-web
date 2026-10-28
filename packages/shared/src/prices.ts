// 물가 API 계약
import { z } from "zod";

/** ISO 3166-1 alpha-3 — 소문자로 와도 대문자로 */
export const CountryCode = z
  .string()
  .regex(/^[A-Za-z]{3}$/, "나라 코드는 영문 3글자 (ISO 3166-1 alpha-3)")
  .transform((s) => s.toUpperCase());

export const LevelsQuery = z.object({ base: CountryCode.default("KOR") });

/** GET /prices/levels — relative 1.2 = 기준 나라보다 20% 비쌈 (같은 연도끼리) */
export const PriceLevels = z.object({
  base: z.string().length(3),
  rows: z.array(
    z.object({
      country: z.string().length(3),
      year: z.number().int(),
      level: z.number().positive(),
      relative: z.number().positive(),
      source: z.string(),
    }),
  ),
});
export type PriceLevels = z.infer<typeof PriceLevels>;

/** POST /prices/collect (관리) */
export const PriceCollectResult = z.object({
  status: z.enum(["ok", "empty", "error"]),
  rows: z.number().int().nonnegative(),
  message: z.string().nullable(),
  years: z.object({ from: z.number().int(), to: z.number().int() }),
});
export type PriceCollectResult = z.infer<typeof PriceCollectResult>;

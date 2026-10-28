// 오류 응답 한 가지 모양 — 검사 실패 · 인증 실패 모두
import { z } from "zod";

export const ApiError = z.object({
  error: z.string(),
  issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
});
export type ApiError = z.infer<typeof ApiError>;

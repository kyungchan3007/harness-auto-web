// 입력 검사 — 모든 경로가 이것 하나로 zod 검사 · 실패 응답은 ApiError 한 가지 모양 (400)
import { zValidator } from "@hono/zod-validator";
import type { ApiError } from "@hav/shared/errors";
import type { ValidationTargets } from "hono";
import type { z } from "zod";

export const validate = <T extends z.ZodType, K extends keyof ValidationTargets>(target: K, schema: T) =>
  zValidator(target, schema, (result, c) => {
    if (result.success) return;
    const body: ApiError = {
      error: "입력값이 올바르지 않습니다",
      issues: result.error.issues.map((i) => ({ path: i.path.join(".") || target, message: i.message })),
    };
    return c.json(body, 400);
  });

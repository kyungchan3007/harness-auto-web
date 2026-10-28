// 환율 API — 읽기는 누구나 · 수집은 관리 토큰이 있을 때만
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../../env";
import { collectDay } from "./collect";
import { isIsoDate, kstDate } from "./rate";
import { d1RateStore, latestRates, rateHistory } from "./store";

const historyQuery = z.object({ days: z.coerce.number().int().min(1).max(1000).default(365) });
const collectQuery = z.object({ date: z.string().refine(isIsoDate, "YYYY-MM-DD 날짜가 아님").optional() });

/** 길이와 상관없이 같은 시간이 걸리는 비교 (토큰 추측 방지) */
function sameToken(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export const fxRoutes = new Hono<{ Bindings: Env }>()
  .get("/latest", async (c) => c.json(await latestRates(c.env.DB)))
  .get("/:currency/history", zValidator("query", historyQuery), async (c) => {
    const currency = c.req.param("currency").toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) return c.json({ error: "통화 코드는 영문 3글자" }, 400);
    const { days } = c.req.valid("query");
    const since = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
    return c.json({ currency, since, rates: await rateHistory(c.env.DB, currency, since) });
  })
  // 과거 날짜 채우기 · 수동 재수집 — ADMIN_TOKEN 이 없으면 경로 자체가 없는 것처럼 (404)
  .post("/collect", zValidator("query", collectQuery), async (c) => {
    const token = c.env.ADMIN_TOKEN;
    if (!token) return c.notFound();
    const auth = c.req.header("authorization") ?? "";
    if (!sameToken(auth, `Bearer ${token}`)) return c.json({ error: "인증 실패" }, 401);
    const date = c.req.valid("query").date ?? kstDate();
    return c.json(await collectDay(d1RateStore(c.env.DB), date, { koreaeximKey: c.env.KOREAEXIM_KEY }));
  });

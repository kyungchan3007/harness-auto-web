// 물가 API — 읽기는 누구나 · 수집은 관리 토큰 · 요청 · 응답 모양은 @hav/shared/prices
import { LevelsQuery, type PriceCollectResult, type PriceLevels } from "@hav/shared/prices";
import { Hono } from "hono";
import { adminGuard } from "../../admin";
import type { Env } from "../../env";
import { validate } from "../../validate";
import { collectPriceLevels } from "./collect";
import { d1PriceStore, relativeLevels } from "./store";

export const priceRoutes = new Hono<{ Bindings: Env }>()
  .get("/levels", validate("query", LevelsQuery), async (c) => {
    const body: PriceLevels = await relativeLevels(c.env.DB, c.req.valid("query").base);
    return c.json(body);
  })
  .post("/collect", async (c) => {
    const blocked = adminGuard(c);
    if (blocked) return blocked;
    const body: PriceCollectResult = await collectPriceLevels(d1PriceStore(c.env.DB));
    return c.json(body);
  });

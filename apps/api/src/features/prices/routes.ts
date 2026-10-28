// 물가 API — 읽기는 누구나 · 수집은 관리 토큰
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { adminGuard } from "../../admin";
import type { Env } from "../../env";
import { collectPriceLevels } from "./collect";
import { d1PriceStore, relativeLevels } from "./store";

const levelsQuery = z.object({ base: z.string().regex(/^[A-Za-z]{3}$/, "나라 코드는 영문 3글자 (ISO 3166-1 alpha-3)").default("KOR") });

export const priceRoutes = new Hono<{ Bindings: Env }>()
  .get("/levels", zValidator("query", levelsQuery), async (c) => c.json(await relativeLevels(c.env.DB, c.req.valid("query").base.toUpperCase())))
  .post("/collect", async (c) => adminGuard(c) ?? c.json(await collectPriceLevels(d1PriceStore(c.env.DB))));

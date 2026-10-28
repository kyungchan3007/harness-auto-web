// 실시간 작업 기록 API — 읽기는 누구나 · 쓰기는 ACTIVITY_TOKEN (에이전트 훅만) · 모양은 @hav/shared/activity
import { ActivityIn, type ActivityList, ActivityQuery } from "@hav/shared/activity";
import { Hono } from "hono";
import { tokenGuard } from "../../admin";
import type { Env } from "../../env";
import { validate } from "../../validate";
import { d1ActivityStore } from "./store";

export const activityRoutes = new Hono<{ Bindings: Env }>()
  .get("/", validate("query", ActivityQuery), async (c) => {
    const { limit, after } = c.req.valid("query");
    const body: ActivityList = { events: await d1ActivityStore(c.env.DB).list(limit, after) };
    // 몇 초마다 불리므로 짧게만 캐시
    c.header("cache-control", "public, max-age=3");
    return c.json(body);
  })
  .post("/", async (c, next) => tokenGuard(c, c.env.ACTIVITY_TOKEN) ?? next(), validate("json", ActivityIn), async (c) => {
    const event = await d1ActivityStore(c.env.DB).add(c.req.valid("json"), new Date().toISOString());
    return c.json(event, 201);
  });

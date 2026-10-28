"use client";

// 실시간 기록 받기 — 같은 주소의 BFF(/bff/activity)를 몇 초마다 · 새 것만(after) · 탭이 숨으면 쉼
import { ActivityList, type ActivityEvent } from "@hav/shared/activity";
import { useEffect, useState } from "react";
import { getJson } from "../../shared/api";
import { mergeEvents } from "./status";

export const POLL_MS = 5_000;

export type Activity = { events: ActivityEvent[]; loaded: boolean; error: string | null; now: number };

export function useActivity(base = "/bff"): Activity {
  const [state, setState] = useState<Activity>({ events: [], loaded: false, error: null, now: 0 });

  useEffect(() => {
    let stopped = false;
    let lastId = 0;
    const tick = async () => {
      if (document.hidden) return;
      const r = await getJson(`/activity?limit=50${lastId ? `&after=${lastId}` : ""}`, ActivityList, { base, timeoutMs: 8_000 });
      if (stopped) return;
      setState((s) => {
        if (!r.ok) return { ...s, loaded: true, error: r.reason, now: Date.now() };
        const events = mergeEvents(s.events, r.data.events);
        lastId = events[0]?.id ?? lastId;
        return { events, loaded: true, error: null, now: Date.now() };
      });
    };
    void tick();
    const id = setInterval(tick, POLL_MS);
    const onShow = () => !document.hidden && void tick();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      stopped = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [base]);

  return state;
}

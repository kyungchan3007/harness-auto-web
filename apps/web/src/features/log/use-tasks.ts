"use client";

// 지난 작업 · 작업 이름 — 빌드 때 받은 것을 먼저 보여 주고, 브라우저에서 /bff/tasks 로 한 번 더 (빌드가 저장보다 먼저 끝나도 채워지게)
import { TasksSummary } from "@hav/shared/tasks";
import { useEffect, useState } from "react";
import { type Fetched, getJson } from "../../shared/api";

/** 새로 받은 게 성공이면 그것 · 아니면 빌드 때 것 (빌드 때 것도 실패면 그 이유) */
export function pickTasks(build: Fetched<TasksSummary>, live: Fetched<TasksSummary> | null): Fetched<TasksSummary> {
  return live?.ok ? live : build;
}

export function useTasks(build: Fetched<TasksSummary>, base = "/bff"): Fetched<TasksSummary> {
  const [live, setLive] = useState<Fetched<TasksSummary> | null>(null);
  useEffect(() => {
    let stopped = false;
    void getJson("/tasks", TasksSummary, { base, timeoutMs: 8_000 }).then((r) => !stopped && setLive(r));
    return () => {
      stopped = true;
    };
  }, [base]);
  return pickTasks(build, live);
}

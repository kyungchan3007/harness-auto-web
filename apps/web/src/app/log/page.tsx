import type { Metadata } from "next";
import { LogPage } from "@/features/log/log-page";
import { api } from "@/shared/api";

// 탭 제목은 사이트 이름만 — "만드는 중" 은 뺌 (2026-10-30 사용자 · 작업 0105)
export const metadata: Metadata = {
  description: "AI 코딩 에이전트가 이 사이트를 만드는 과정을 실시간으로",
};

// 지난 작업 · 작업 이름은 빌드 때 우리 API 에서 (GitHub Actions 가 저장 · 브라우저가 한 번 더) · 실시간 기록은 브라우저가 /bff/activity 에서
// 사이트 상태 점검판도 빌드 때 한 번 · 브라우저가 5분마다 다시 (작업 0105)
export default async function Page() {
  const [tasks, status] = await Promise.all([api.tasks(), api.status()]);
  return <LogPage tasks={tasks} status={status} builtAt={new Date().toISOString()} />;
}

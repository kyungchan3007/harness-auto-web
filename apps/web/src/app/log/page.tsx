import type { Metadata } from "next";
import { LogPage } from "@/features/log/log-page";
import { api } from "@/shared/api";

export const metadata: Metadata = {
  title: "만드는 중 · Tripfx",
  description: "AI 코딩 에이전트가 이 사이트를 만드는 과정을 실시간으로",
};

// 지난 작업 · 작업 이름은 빌드 때 우리 API 에서 (GitHub Actions 가 저장 · 브라우저가 한 번 더) · 실시간 기록은 브라우저가 /bff/activity 에서
export default async function Page() {
  return <LogPage tasks={await api.tasks()} />;
}

import type { Metadata } from "next";
import { fetchDoneTasks, fetchTaskNames } from "@/features/log/github";
import { LogPage } from "@/features/log/log-page";

export const metadata: Metadata = {
  title: "만드는 중 · Tripfx",
  description: "AI 코딩 에이전트가 이 사이트를 만드는 과정을 실시간으로",
};

// 지난 작업 · 작업 이름은 빌드 때 GitHub 에서 · 실시간 기록은 브라우저가 /bff/activity 에서
export default async function Page() {
  const [done, names] = await Promise.all([fetchDoneTasks(), fetchTaskNames()]);
  return <LogPage done={done} names={names.ok ? names.data : {}} />;
}

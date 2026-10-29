import { Home } from "@/features/home/home";
import { api, mustHave } from "@/shared/api";

// 홈 — 빌드할 때 API 에서 받아 정적 페이지로 (실패해도 빌드는 성공 · 화면은 "자료 없음")
export default async function Page() {
  const [latest, signals, levels, heroHistory, tasks] = await Promise.all([api.latest(), api.signals(), api.priceLevels(), api.history("USD", 365), api.tasks()]);
  return <Home latest={mustHave(latest, "오늘 환율")} signals={signals} levels={levels} heroHistory={heroHistory} tasks={tasks} />;
}

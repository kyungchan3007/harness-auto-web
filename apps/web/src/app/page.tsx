import { Home } from "@/features/home/home";
import { api } from "@/shared/api";

// 홈 — 빌드할 때 API 에서 받아 정적 페이지로 (실패해도 빌드는 성공 · 화면은 "자료 없음")
export default async function Page() {
  const [latest, signals] = await Promise.all([api.latest(), api.signals()]);
  return <Home latest={latest} signals={signals} />;
}

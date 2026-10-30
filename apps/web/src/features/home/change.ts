// 홈 통화 칸 "1개월 -1.7%" — 지난 값만 · 예측 아님 (SIG-01 · 작업 0096)
//   원화 기준: 오르면 외화가 비싸짐(빨강) · 내리면 싸짐(파랑) — 신호 색과 같은 뜻
export function monthChangeText(pct: number): { text: string; tone: "up" | "down" | "flat"; label: string } {
  if (Math.abs(pct) < 0.05) return { text: "0.0%", tone: "flat", label: "1개월 전과 거의 같음" };
  const text = `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
  return pct > 0 ? { text, tone: "up", label: `1개월 전보다 ${text} 비싸짐` } : { text, tone: "down", label: `1개월 전보다 ${text.slice(1)} 싸짐` };
}

// 통화 목록 정렬 — 기본(지역 순) · 지난 1개월 많이 싸진 순 · 많이 비싸진 순 (작업 0099)
//   변화율이 없는 통화(기록 모자람)는 뒤로 · 지난 값만 (예측 아님 SIG-01)
export type SortId = "region" | "cheaper" | "pricier";
export const SORTS: { id: SortId; label: string }[] = [
  { id: "region", label: "기본" },
  { id: "cheaper", label: "1개월 많이 싸진 순" },
  { id: "pricier", label: "많이 비싸진 순" },
];

export function sortByChange<T extends { currency: string; change: number | null }>(items: T[], sort: SortId): T[] {
  if (sort === "region") return items;
  const dir = sort === "cheaper" ? 1 : -1;
  return [...items].sort((a, b) => {
    if (a.change == null) return b.change == null ? 0 : 1;
    if (b.change == null) return -1;
    return (a.change - b.change) * dir;
  });
}

/** 목록 옆 작은 글자 "-1.9%" */
export const pctText = (pct: number) => `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;

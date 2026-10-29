"use client";

// 장애 안내 줄 — 2026-10-29 D1 하루 읽기 한도 초과로 API 가 500 (작업 0080 · 사용자 요청: "내일 09:00 시까지 한도 문제로 데이터 못불러 온다고 표시를 하자")
//   빌드 때 이미 끝난 시각이면 HTML 에 안 넣음(show) · 페이지를 연 채로 시각이 지나면 브라우저가 숨김
//   다음 장애 때 다시 쓰려면 OUTAGE 를 바꿈 · 끝나면 null
import { useEffect, useState } from "react";

export const OUTAGE: { until: string; text: string } | null = {
  until: "2026-10-30T00:00:00Z", // 한국 10월 30일(금) 09:00 — D1 한도가 다시 차는 때 (00:00 UTC)
  text: "데이터베이스 하루 사용 한도를 넘겨 지금은 환율 · 물가 · 작업 기록을 불러오지 못합니다. 한국 시간 10월 30일(금) 오전 9시부터 다시 정상으로 돌아옵니다.",
};

export const outageActive = (now = Date.now()) => OUTAGE !== null && now < Date.parse(OUTAGE.until);

export function OutageNotice({ show }: { show: boolean }) {
  const [on, setOn] = useState(show);
  useEffect(() => {
    if (!on || !OUTAGE) return;
    const left = Math.max(0, Date.parse(OUTAGE.until) - Date.now());
    const t = setTimeout(() => setOn(false), Math.min(left, 2 ** 31 - 1));
    return () => clearTimeout(t);
  }, [on]);
  if (!on || !OUTAGE) return null;
  return (
    <div role="status" data-surface="dark" className="border-b border-expensive/40 bg-surface px-4 py-2.5 text-center text-xs leading-relaxed text-fg sm:px-8 sm:text-sm">
      <span aria-hidden className="mr-1.5">⚠️</span>
      {OUTAGE.text}
    </div>
  );
}

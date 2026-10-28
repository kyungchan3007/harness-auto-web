import type { ReactNode } from "react";

/** 요약 카드 — 아이콘 하나 + 짧은 문장 (참고 페이지 검정 카드 격자) */
export function Card({ icon, title, children }: { icon?: ReactNode; title?: ReactNode; children?: ReactNode }) {
  return (
    <div className="rounded-card bg-surface-2 p-8">
      {icon && <div className="mb-6 text-3xl text-accent">{icon}</div>}
      {title && <p className="text-lg font-semibold text-fg">{title}</p>}
      {children && <div className="mt-2 text-fg-2">{children}</div>}
    </div>
  );
}

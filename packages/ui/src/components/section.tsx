import type { ReactNode } from "react";

export type Surface = "dark" | "elevated" | "light";

/** 이야기 섹션 — 작은 소제목 → 큰 제목 → 회색 본문 (참고 페이지 패턴) */
export function Section({
  surface = "dark",
  eyebrow,
  title,
  children,
  id,
}: {
  surface?: Surface;
  eyebrow?: string;
  title?: ReactNode;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} data-surface={surface} className="bg-surface px-4 py-24 text-fg sm:px-8 sm:py-32">
      <div className="mx-auto max-w-5xl">
        {eyebrow && <p className="text-eyebrow font-semibold text-fg-2">{eyebrow}</p>}
        {title && <h2 className="mt-3 text-title font-semibold tracking-tight">{title}</h2>}
        {children && <div className="mt-10 text-lead text-fg-2">{children}</div>}
      </div>
    </section>
  );
}

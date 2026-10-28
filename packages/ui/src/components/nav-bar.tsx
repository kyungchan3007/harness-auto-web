import type { ReactNode } from "react";

/** current = 지금 보고 있는 페이지 (글자가 밝고 화면 읽기 프로그램에도 알림) */
export type NavLink = { href: string; label: string; current?: boolean };

/** 따라오는 상단 — 사이트 이름 + 메뉴 + 버튼 하나 (참고 페이지 패턴) */
export function NavBar({ title, logo, links, action }: { title: string; logo?: ReactNode; links: NavLink[]; action?: ReactNode }) {
  return (
    <header data-surface="dark" className="sticky top-0 z-50 border-b border-line bg-surface/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-13 max-w-5xl items-center gap-4 px-4 text-fg sm:gap-6 sm:px-8">
        <a href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          {logo}
          {title}
        </a>
        {/* 휴대폰에서도 메뉴는 보이고 · 버튼은 넓은 화면에서만 (좁으면 메뉴가 먼저) */}
        <ul className="ml-auto flex gap-4 text-xs whitespace-nowrap text-fg-2 sm:gap-5">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} aria-current={l.current ? "page" : undefined} className={`transition-colors hover:text-fg ${l.current ? "text-fg" : ""}`}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        {action && <div className="hidden sm:block">{action}</div>}
      </nav>
    </header>
  );
}

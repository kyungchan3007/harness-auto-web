import type { ReactNode } from "react";

export type NavLink = { href: string; label: string };

/** 따라오는 상단 — 사이트 이름 + 메뉴 + 버튼 하나 (참고 페이지 패턴) */
export function NavBar({ title, links, action }: { title: string; links: NavLink[]; action?: ReactNode }) {
  return (
    <header data-surface="dark" className="sticky top-0 z-50 border-b border-line bg-surface/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-13 max-w-5xl items-center gap-6 px-4 text-fg sm:px-8">
        <a href="/" className="text-xl font-semibold tracking-tight">
          {title}
        </a>
        <ul className="ml-auto hidden gap-5 text-xs text-fg-2 sm:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        {action && <div className="ml-auto sm:ml-0">{action}</div>}
      </nav>
    </header>
  );
}

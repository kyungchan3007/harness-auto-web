import type { ReactNode } from "react";

/** current = 지금 보고 있는 페이지 (글자가 밝고 화면 읽기 프로그램에도 알림) */
export type NavLink = { href: string; label: string; current?: boolean };

/** 따라오는 상단 — 사이트 이름 + 메뉴 + 버튼 하나 (참고 페이지 패턴) */
export function NavBar({ title, logo, links, action }: { title: string; logo?: ReactNode; links: NavLink[]; action?: ReactNode }) {
  return (
    <header data-surface="dark" className="sticky top-0 z-50 border-b border-line bg-surface/80 backdrop-blur-xl">
      {/* 휴대폰(sm 아래): 사이트 이름 줄(h-12) + 메뉴 줄(h-8) = 5rem · 넓은 화면: 한 줄 h-13 — 고정 높이를 쓰는 곳은 NAV_TOP 참고 */}
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 px-4 text-fg sm:h-13 sm:flex-nowrap sm:gap-6 sm:px-8">
        <a href="/" className="flex h-12 shrink-0 items-center gap-2 text-xl font-semibold tracking-tight sm:h-auto">
          {logo}
          {title}
        </a>
        {/* 휴대폰: 메뉴를 둘째 줄에 펼쳐 다 보이게 (한 줄로 두니 320px 에서 뒤 메뉴 둘이 잘려 안 보였음 · 작업 0109) · 버튼은 넓은 화면에서만 */}
        <ul className="flex h-8 w-full min-w-0 items-start justify-between gap-3 overflow-x-auto text-xs whitespace-nowrap text-fg-2 [scrollbar-width:none] sm:ml-auto sm:h-auto sm:w-auto sm:items-center sm:justify-start sm:gap-5">
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

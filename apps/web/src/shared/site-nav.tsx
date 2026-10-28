// 이 사이트(Tripfx)의 상단 메뉴 — 홈 · 만드는 중이 같이 씀
// 메뉴 모양은 디자인 시스템(@hav/ui/nav-bar) · 사이트 이름 · 링크 같은 이 사이트 설정만 여기 (디자인 시스템은 사이트를 모름)
import { NavBar } from "@hav/ui/nav-bar";
import Link from "next/link";

export type Page = "home" | "log";

export function SiteNav({ page }: { page: Page }) {
  return (
    <NavBar
      title="Tripfx"
      // eslint-disable-next-line @next/next/no-img-element -- 정적 내보내기 · 작은 로고 하나
      logo={<img src="/icon.svg" alt="" width={24} height={24} className="size-6" />}
      links={[
        { href: "/#today", label: "오늘 환율" },
        { href: "/#currencies", label: "통화" },
        { href: "/log", label: "만드는 중", current: page === "log" },
      ]}
      action={
        <Link href="/#currencies" className="inline-flex rounded-pill bg-accent px-4 py-1.5 text-xs font-semibold text-on-accent">
          통화 보기
        </Link>
      }
    />
  );
}

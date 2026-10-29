import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/shared/site-nav";

// 없는 주소 — 기본 화면은 영어("This page could not be found")라 한국어로 (사용자에게 보이는 글은 모두 한국어)
export const metadata: Metadata = { title: "없는 페이지 · Tripfx", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <SiteNav page="home" />
      <main data-surface="dark" className="bg-surface px-4 py-32 text-fg sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-eyebrow font-semibold text-fg-2">404</p>
          <h1 className="mt-3 text-title font-semibold tracking-tight">
            찾는 페이지가
            <br />
            없습니다.
          </h1>
          <p className="mt-6 text-lead text-fg-2">주소가 바뀌었거나 잘못 입력됐을 수 있어요.</p>
          <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-accent">
            <Link href="/" className="hover:underline">
              오늘 환율 →
            </Link>
            <Link href="/currencies" className="hover:underline">
              통화 둘러보기 →
            </Link>
            <Link href="/prices" className="hover:underline">
              여행 물가 →
            </Link>
            <Link href="/calc" className="hover:underline">
              직구 계산 →
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
